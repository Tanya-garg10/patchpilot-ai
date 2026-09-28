# PatchPilot

### From Bug Report to Verified Fix

PatchPilot is an AI-powered developer workflow platform that improves the debugging lifecycle by guiding developers through a structured, traceable path from bug report to verified solution.

```
BUG REPORT → REPRODUCE → ANALYZE → FIX → TEST → VERIFY
```

> Built with IBM Bob IDE 

## Problem

Modern debugging is fragmented. Developers context-switch between issue trackers, code editors, test runners, and documentation — losing context at every step. AI tools help with individual tasks but don't connect the full workflow.

## Solution

PatchPilot keeps the entire debug lifecycle in one place:

1. **Report** — Structured bug report with reproduction steps
2. **Reproduce** — Source code context and file inspection
3. **Analyze** — AI-powered root cause analysis with confidence scoring
4. **Fix** — Generated fix with before/after code diff
5. **Test** — Regression test generation and execution tracking
6. **Verify** — Verification timeline and PR summary generation

Humans remain in control. Every AI suggestion requires developer review before being applied.

## Features

- **Dashboard** — Workflow pipeline visualization and session metrics
- **Debug Session Workspace** — Three-column layout (context / code / AI copilot)
- **Root Cause Analysis** — Structured AI analysis with confidence score, affected files, suspicious line highlighting
- **Code Diff Viewer** — Side-by-side before/after diff for every fix
- **Test Lab** — Test case generation with preview, mark-ready, and execute workflow
- **Verification** — Timeline tracking and verification status management
- **Workflow Impact** — Session-derived metrics (no fabricated ROI)
- **PR Summary** — Auto-generated pull request description from session data
- **Activity Timeline** — Full audit trail of debug lifecycle events
- **ShopStack Demo** — Ready-to-run demonstration with a real reproducible cart bug

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture document.

```
Next.js 16 App Router
└── app/           Page components
└── components/    Reusable UI components
└── lib/
    ├── types.ts          Core data models
    ├── store.ts          localStorage persistence
    ├── demo-data.ts      ShopStack fixtures
    ├── ai-provider.ts    AI provider abstraction
    └── run-demo.ts       Demo seeder
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| State | Browser localStorage |
| Build | Turbopack (dev) |

## ShopStack Demo

ShopStack is a small e-commerce cart service included as the demo application. It contains **one intentional, reproducible bug**:

**Bug:** When the final item is removed from the cart, the cart state is not persisted back to the store. A subsequent read returns the stale pre-removal state, producing an incorrect (potentially non-zero) total.

**Files:** `shopstack-demo/src/cart/cartService.js` (bug), `shopstack-demo/tests/cart.test.js`

The DemoProvider delivers deterministic analysis and fix generation for this exact bug, demonstrating the full PatchPilot workflow without requiring a real AI backend.

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone <repository-url>
cd patchpilot
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local` for AI provider configuration (optional — demo works without it):

```env
# AI Provider (optional — defaults to demo)
AI_PROVIDER=demo

# External AI provider (future)
# AI_PROVIDER=external
# AI_PROVIDER_API_KEY=your-key-here
# AI_PROVIDER_ENDPOINT=https://your-provider.com/v1
# AI_PROVIDER_MODEL=your-model-id
```

> **Never commit `.env.local` to source control.**

## Testing

The ShopStack demo includes Jest test scenarios. To run them (requires Jest):

```bash
cd shopstack-demo
npm init -y
npm install --save-dev jest
npx jest tests/cart.test.js
```

Note: The tests will **fail** on the original buggy code (as designed) and **pass** after the fix is applied.

## IBM Bob Usage

IBM Bob IDE was the primary development environment for PatchPilot. See [docs/IBM_BOB_USAGE.md](docs/IBM_BOB_USAGE.md) for a detailed breakdown of how Bob contributed to each area of the project.

## Demo Instructions

See [docs/DEMO.md](docs/DEMO.md) for the complete 3-minute demo walkthrough.

**Quick start:**
1. `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Click **"Run Demo"**
4. Follow the workflow: Analyze → Fix → Test → Verify

## Known Limitations

- **No real AI backend** — The current implementation uses the DemoProvider with deterministic responses for ShopStack only. An external AI provider can be integrated by implementing `ExternalAIProvider` in `lib/ai-provider.ts`.
- **localStorage only** — All data is stored in the browser. A server-side database would be needed for multi-user or persistent deployments.
- **Demo scope** — Root cause analysis and fix generation are only fully demonstrated for the ShopStack cart bug. Other sessions use placeholder responses.
- **No real test execution** — Test cases are simulated. Real execution would require a test runner integration.
- **No git integration** — The "Apply Fix" action updates local state only. Real git operations are not performed.

## Future Improvements

- [ ] Real AI provider integration (OpenAI, Anthropic, watsonx)
- [ ] Git integration for actual fix application
- [ ] Real test runner integration (Jest, Vitest, pytest)
- [ ] Server-side persistence (PostgreSQL / SQLite)
- [ ] Repository import (GitHub, GitLab)
- [ ] Collaborative sessions (multiple developers)
- [ ] Metrics export and historical trend analysis

## API Reference

See [docs/API.md](docs/API.md) for the full API reference.
