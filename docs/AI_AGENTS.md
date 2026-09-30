# AI Agents — PatchPilot

This document describes PatchPilot's multi-agent software engineering workflow.

---

## Overview

PatchPilot uses a **multi-agent orchestration architecture** where four specialized AI agents collaborate to resolve software issues autonomously. Each agent has a clearly defined role, structured input/output contract, and explicit handoff boundaries.

The workflow is linear with one **human-in-the-loop gate** at the Fix approval step.

```
Issue / Bug Report
       ↓
Investigator Agent       ← Phase 1: Investigation
       ↓
Root Cause + Evidence
       ↓
Fix Agent                ← Phase 2: Fix Generation
       ↓
Developer Approval       ← Human gate (required)
       ↓
Test Agent               ← Phase 3: Regression Testing
       ↓
Verification Agent       ← Phase 4: Verification
       ↓
PR Summary Agent         ← Phase 5: Output
       ↓
Verified Fix + PR Summary
```

---

## Agent Specifications

### 1. Investigator Agent

**Purpose:** Parse the issue, investigate the repository, identify root cause.

**Responsibilities:**
- Parse issue title, description, expected vs actual behavior
- Search repository files for relevant code
- Identify affected modules and components
- Trace dependency chains to origin of fault
- Analyze logs and reproduction information
- Collect and rank evidence by relevance
- Determine root cause with confidence score

**Output contract:**
```
{
  rootCause: string        // Root cause statement
  confidence: number       // 0–100% (AI estimate)
  affectedFiles: string[]  // File paths
  suspiciousLines: [       // Annotated code lines
    { file, line, code, reason }
  ]
  explanation: string      // Technical explanation
  recommendedFix: string   // Suggested fix strategy
  risks: string[]          // Potential risks
  edgeCases: string[]      // Edge cases to consider
}
```

**Demo behavior (ShopStack BUG-1042):**
- Identifies `useCart.ts` as root cause (local useState on remount)
- Identifies `cartStore.ts` as the unused persistent solution
- Returns 94% confidence

---

### 2. Fix Agent

**Purpose:** Generate a minimal, reviewable patch from the root cause analysis.

**Responsibilities:**
- Identify files requiring modification
- Generate a minimal, targeted patch
- Explain technical reasoning for each change
- Show before/after code side-by-side
- Generate unified diff for developer review
- Estimate affected modules and regression risk
- Block on developer approval — never auto-apply

**Output contract:**
```
{
  problem: string         // Problem statement
  rootCause: string       // Root cause (from Investigator)
  filesToChange: string[] // Files being modified
  explanation: string     // Change explanation
  risk: string            // Risk level
  edgeCases: string[]     // Edge cases addressed
  verificationPlan: string[] // How to verify the fix
  diffs: [
    { file, before, after, explanation }
  ]
}
```

**Human gate:** Developer must explicitly approve the patch. The workflow does not continue until `fixApplied: true` is set.

---

### 3. Test Agent

**Purpose:** Generate regression tests after the fix is approved.

**Responsibilities:**
- Generate test for original bug reproduction scenario
- Generate regression tests for adjacent behavior
- Generate edge-case tests based on code analysis
- Track execution status per test case
- Report pass/fail/needs-verification results
- Label all simulated executions clearly

**Output contract:**
```
TestCase[] where each:
{
  id: string
  sessionId: string
  name: string
  description: string
  code: string          // Test source
  status: 'suggested' | 'ready' | 'executed' | 'passed' | 'failed' | 'needs_verification'
  result: string | null
  executedAt: string | null
}
```

**Demo behavior (BUG-1042):** Generates 5 tests covering:
1. Cart persists after route navigation
2. Quantity unchanged after navigation
3. Multiple items consistent
4. Empty cart behavior preserved
5. Checkout state cleared correctly

---

### 4. Verification Agent

**Purpose:** Independently verify the full workflow was correctly completed.

**Responsibilities:**
- Verify original issue was addressed
- Confirm intended behavior restored
- Verify all regression tests passed
- Check for unrelated file modifications
- Confirm patch is consistent with root cause analysis
- Produce final verification verdict

**Output contract:**
```
VerificationStatus: 'verified' | 'partially_verified' | 'needs_verification' | 'failed'
```

**Verification checklist:**
```
Original Issue       RESOLVED / UNRESOLVED
Root Cause           CONFIRMED / UNCONFIRMED
Code Patch           REVIEWED
Regression Tests     N/N PASSED
Unrelated Changes    NONE / DETECTED
Verification         PASSED / FAILED
```

---

### 5. PR Summary Agent

**Purpose:** Generate a structured pull request description from session data.

**Output:**
```
## {title}

**Root Cause:** ...
**Changes Made:** ...
**Files Changed:** ...
**Tests Added:** N
**Tests Passed:** N / N executed
**Verification:** Verified / Partially Verified
**Risks:** ...
**Next Steps:** ...
```

---

## Agent Orchestrator

The orchestrator manages workflow state transitions:

```
Session Status          Meaning
─────────────────────────────────────────
open                    Issue created
analyzing               Investigator running
analyzed                Root cause identified
fix_ready               Fix generated (awaiting approval)
fix_applied             Developer approved and applied
testing                 Test Agent generating/running tests
verified                Verification Agent completed
closed                  Session archived
```

State transitions are persisted in `lib/store.ts` via localStorage.

---

## AI Provider Architecture

```
AIProvider (interface)
  ├── DemoProvider      — Deterministic responses for ShopStack demo
  ├── EvorozenProvider  — Evorozen Neural Pulse (requires credentials)
  └── ExternalAIProvider — Generic LLM provider (configurable)
```

Provider selection via environment:
```
AI_PROVIDER=demo      (default — no credentials required)
AI_PROVIDER=evorozen  (requires EVOROZEN_API_KEY)
AI_PROVIDER=external  (requires AI_PROVIDER_API_KEY)
```

---

## Evorozen Neural Pulse Integration

The `EvorozenProvider` is designed to use Neural Pulse as the intelligence/context layer for:

- **Agent context management** — Issue history and session state across agents
- **Repository investigation memory** — Cached repository analysis for faster investigation
- **Workflow routing** — Routing queries to appropriate specialized agents
- **Structured engineering knowledge** — Domain-specific debugging knowledge

The integration point is in [`lib/ai-provider.ts`](../lib/ai-provider.ts) — the `EvorozenProvider.analyze()` and `EvorozenProvider.generateFix()` methods contain the commented integration scaffold.

**Note:** The EvorozenProvider gracefully falls back to DemoProvider if `EVOROZEN_API_KEY` is not set. The application remains fully functional in demo mode without credentials.

---

## Important Principles

1. **Humans stay in control** — No AI change is auto-applied. Developer approval is required.
2. **Transparency** — Every agent step is visible in the Activity feed and Agent panel.
3. **Demo integrity** — Demo mode is clearly labeled. No simulated result is presented as real.
4. **Confidence is an estimate** — AI confidence scores are explicitly labeled as AI-generated estimates, not guarantees.
