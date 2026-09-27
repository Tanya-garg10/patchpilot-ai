# PatchPilot Architecture

## Overview

PatchPilot is a Next.js 16 application with a client-side-first architecture. All state is persisted to browser `localStorage`, requiring no backend server for the demo workflow.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                        │
│                                                               │
│  app/                                                         │
│  ├── page.tsx              (Dashboard)                        │
│  ├── sessions/             (Debug Sessions)                   │
│  │   ├── page.tsx          (Session list)                     │
│  │   ├── new/page.tsx      (New session form)                 │
│  │   └── [id]/             (Session detail workspace)         │
│  │       ├── page.tsx      (Three-column workspace)           │
│  │       ├── verify/       (Verification screen)              │
│  │       ├── pr-summary/   (PR Summary page)                  │
│  │       └── workflow-impact/ (Workflow Impact)               │
│  ├── projects/page.tsx     (Projects)                         │
│  ├── test-lab/page.tsx     (Test Lab)                         │
│  ├── activity/page.tsx     (Activity Timeline)                │
│  └── settings/page.tsx     (Settings)                         │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  lib/       │
                    │  ├── types.ts        (Core models)        │
                    │  ├── store.ts        (localStorage CRUD)  │
                    │  ├── demo-data.ts    (ShopStack fixtures) │
                    │  ├── ai-provider.ts  (AI abstraction)     │
                    │  ├── run-demo.ts     (Demo seeder)        │
                    │  └── utils.ts        (Helpers)            │
                    └─────────────┘
```

---

## Core Data Flow

```
User creates bug report
        │
        ▼
createSession() → localStorage
        │
        ▼
DemoProvider.analyze() → AnalysisResult
        │
        ▼
applyAnalysis() → session.analysis saved
        │
        ▼
DemoProvider.generateFix() → GeneratedFix
        │
        ▼
Developer reviews diff (DiffViewer)
        │
        ▼
applyFix() → session.fixApplied = true
        │
        ▼
Test Lab: executeTestCase() → TestCase.status = 'passed'
        │
        ▼
setVerification() → session.verificationStatus
        │
        ▼
generatePRSummary() → clipboard / export
```

---

## AI Provider Pattern

```typescript
interface AIProvider {
  name: string;
  analyze(session, sourceFiles): Promise<AnalysisResult>;
  generateFix(session, analysis): Promise<GeneratedFix>;
}

// Current: Demo (deterministic ShopStack responses)
class DemoProvider implements AIProvider { ... }

// Future: Real AI (configure via env vars)
class ExternalAIProvider implements AIProvider { ... }

// Factory
function getAIProvider(): AIProvider {
  return process.env.AI_PROVIDER === 'external'
    ? new ExternalAIProvider()
    : new DemoProvider();
}
```

### Swapping to a Real AI Provider

1. Set `AI_PROVIDER=external` in `.env.local`
2. Set `AI_PROVIDER_API_KEY`, `AI_PROVIDER_ENDPOINT`, `AI_PROVIDER_MODEL`
3. Implement the `analyze()` and `generateFix()` methods in `ExternalAIProvider`
4. The rest of the application needs no changes

---

## State Management

PatchPilot uses browser `localStorage` for all persistence. There is no backend database.

| Key | Contents |
|-----|---------|
| `pp_projects` | `Project[]` |
| `pp_sessions` | `DebugSession[]` |
| `pp_test_cases` | `TestCase[]` |
| `pp_activity` | `ActivityEvent[]` |
| `pp_metrics` | `WorkflowMetric[]` |

The `lib/store.ts` module provides typed CRUD operations for all entities.

---

## Component Architecture

```
components/
├── layout/
│   ├── AppShell.tsx     (Root layout wrapper)
│   ├── Sidebar.tsx      (Navigation sidebar)
│   └── TopHeader.tsx    (Top bar)
├── ui/
│   ├── Button.tsx       (Multi-variant button)
│   ├── Badge.tsx        (Status badges)
│   ├── Card.tsx         (Card/CardHeader/CardBody)
│   ├── EmptyState.tsx   (Empty state display)
│   └── LoadingSpinner.tsx
└── debug/
    ├── CodeViewer.tsx   (Line-numbered code display with suspicious highlighting)
    ├── FileTree.tsx     (File navigator)
    └── DiffViewer.tsx   (Before/After diff display)
```

---

## Workflow Stages

Each `DebugSession` progresses through these stages:

| Stage | Status | Description |
|-------|--------|-------------|
| Report | `open` | Bug report created |
| Reproduce | `open` | Reproduction steps reviewed |
| Analyze | `analyzing` → `analyzed` | AI analysis running/complete |
| Fix | `fix_ready` → `fix_applied` | Fix generated and applied |
| Test | `testing` | Tests generated/executed |
| Verify | `verified` | Verification complete |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| State | Browser localStorage |
| Code Display | Custom CodeViewer (no Monaco — avoids SSR complexity) |
| Charts | Recharts (available, used as needed) |
| AI | DemoProvider / ExternalAIProvider abstraction |
