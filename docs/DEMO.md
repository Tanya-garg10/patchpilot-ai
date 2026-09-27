# PatchPilot Demo Guide

## The ShopStack Demo

PatchPilot ships with a pre-configured demonstration built around **ShopStack** — a small e-commerce cart service with a real, reproducible bug.

### The Bug

**Title:** Cart total becomes negative after removing the last item

**Root Cause:** In `cartService.js:removeItem()`, when the last item is removed, the function calculates `total = 0` correctly but returns the cart object WITHOUT saving it back to `cartStore`. The early return skips the `cartStore[userId] = cart` assignment, leaving stale state.

**Impact:** A subsequent `getCart()` call returns the unmodified store entry with the old items and total.

---

## Demo Flow (3 minutes)

### Step 1 — Open PatchPilot
```
http://localhost:3000
```

### Step 2 — Run Demo
Click **"Run Demo"** on the Dashboard or Sessions page.

This seeds the ShopStack project and bug report into the application.

### Step 3 — Open Bug Session
You are automatically redirected to the debug workspace for the ShopStack cart bug.

### Step 4 — Analyze
In the **AI Debug Copilot** panel (right column), click **"Analyze Bug"**.

Wait ~2 seconds for the DemoProvider to return the analysis.

Observe:
- Root Cause card (identifies the exact line)
- Why It Happens explanation  
- Recommended Fix
- Confidence: 94%
- Affected Files: `src/cart/cartService.js`
- Suspicious line: Line 25 (the early return)

### Step 5 — Review Root Cause
In the center code panel, the suspicious line (line 25) is highlighted in yellow.

Click the file in the file tree to inspect it.

### Step 6 — Generate Fix
Click **"Generate Fix"** in the Copilot panel.

### Step 7 — Review Diff
Click **"Review Diff"** to see the before/after side-by-side code comparison.

BEFORE: The early-return branch that skips `cartStore[userId] = cart`
AFTER: Unconditional save — always persists the cart after mutation

### Step 8 — Apply Fix
Click **"Apply Fix"** to record the fix as applied.

Activity event is logged. Session status updates to `fix_applied`.

### Step 9 — Generate Tests
Click **"Generate Tests"** → redirected to Test Lab.

6 test scenarios are shown:
1. Remove final cart item → empty cart
2. Empty cart total equals zero
3. Remove one item from multi-item cart
4. Multiple quantities recalculation
5. Sequential operations
6. Negative total prevention

### Step 10 — Execute Tests
Click **"Execute All"** in Test Lab.

Since the fix has been applied, all tests will show **Passed** status.

### Step 11 — Verify
Navigate to the session → click through to **Verify** page.

Set verification status to **"Verified"**.

Review the timeline showing the complete debug lifecycle.

### Step 12 — Workflow Impact
Navigate to **Workflow Impact** for the session.

See session-derived metrics: files inspected, files changed, tests generated, tests executed, human approval points.

### Step 13 — PR Summary
Click **"View Full PR"** → PR Summary page.

Click **"Copy"** to copy the generated PR summary to clipboard.

---

## ShopStack Source Files

The ShopStack demo source files are located in:

```
shopstack-demo/
├── src/
│   ├── cart/
│   │   ├── cartService.js      ← Contains the bug
│   │   ├── cartController.js
│   │   └── cartUtils.js
│   ├── products/
│   │   └── productService.js
│   └── api/
│       └── cartRoutes.js
└── tests/
    └── cart.test.js
```

These files are also embedded in `lib/demo-data.ts` (as `SHOPSTACK_FILES`) for display in the code viewer.

---

## Reproducing the Bug Manually

```javascript
const { addItem, removeItem, getCart } = require('./shopstack-demo/src/cart/cartService');

// Add one item
addItem('user1', { id: 'p001', name: 'Headphones', price: 79.99 }, 1);

// Remove it
removeItem('user1', 'p001');

// Get cart — BUG: total may not be 0, store not updated
const cart = getCart('user1');
console.log(cart.total); // May show 79.99 instead of 0
```

---

## Resetting the Demo

Go to **Settings** → **Clear Data** to wipe all localStorage data and start fresh.

Then click **"Run Demo"** again to re-seed the ShopStack session.
