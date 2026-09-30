# PatchPilot

### From Bug Report to Verified Fix

PatchPilot is a structured developer workflow platform that guides debugging from **issue report to verified solution** in one traceable workspace.

Instead of switching between issue trackers, editors, test runners, and documentation, PatchPilot brings the debugging lifecycle together:

```text
BUG REPORT
    ↓
REPRODUCE
    ↓
ANALYZE
    ↓
ROOT CAUSE
    ↓
FIX
    ↓
TEST
    ↓
VERIFY
```

> **Built with IBM Bob IDE**

## 🚀 Why PatchPilot?

Debugging is rarely just about writing a fix.

A typical debugging workflow involves:

* Understanding the issue
* Reproducing the problem
* Finding the relevant code
* Identifying the root cause
* Designing a safe fix
* Writing regression tests
* Verifying that the original issue is actually resolved

These steps are often scattered across multiple tools, which leads to context switching and makes the debugging process harder to trace.

**PatchPilot brings these steps into a single structured workflow.**

## 💡 The Solution

PatchPilot provides a guided debugging lifecycle where every stage builds on the previous one.

### 1. Report

Create a structured issue with:

* Problem description
* Reproduction steps
* Expected behavior
* Actual behavior
* Severity and priority
* Relevant project context

### 2. Reproduce

Inspect the issue context and relevant source files before attempting a fix.

### 3. Analyze

Generate a structured root-cause analysis containing:

* Root cause
* Supporting evidence
* Affected files
* Suspicious code locations
* Confidence score
* Recommended approach

### 4. Fix

Review a proposed solution through a side-by-side code diff.

Developers remain in control and can review the change before applying it.

### 5. Test

Generate regression and edge-case test scenarios based on the identified bug and proposed fix.

### 6. Verify

Track the final verification state and generate a PR-ready summary from the debugging session.

## 🧑‍💻 Human-in-the-Loop

PatchPilot is designed around a simple principle:

> **AI can assist with the work. Developers remain responsible for approving the change.**

The workflow does not silently apply generated fixes.

Developers can:

* Review the root-cause analysis
* Inspect affected files
* Review the proposed code diff
* Approve or reject a fix
* Review generated tests
* Track verification status

This keeps the debugging process **traceable and reviewable**.

# ✨ Features

### 📊 Engineering Dashboard

A central dashboard showing:

* Active debugging sessions
* Workflow progress
* Session metrics
* Recent activity
* Verification status

### 🔍 Debug Session Workspace

A three-column developer workspace:

```text
┌────────────────┬──────────────────────┬─────────────────────┐
│ Issue Context  │ Code Intelligence    │ AI Copilot          │
│                │                      │                     │
│ Bug details    │ Source code          │ Analysis            │
│ Reproduction   │ File explorer        │ Suggestions         │
│ Expected/Actual│ Code locations       │ Agent activity      │
└────────────────┴──────────────────────┴─────────────────────┘
```

This keeps the issue, code, and analysis visible at the same time.

### 🧠 Root Cause Analysis

PatchPilot presents structured debugging evidence including:

* Root cause
* Confidence score
* Affected files
* Suspicious lines
* Supporting evidence
* Recommended fix strategy

### 📝 Code Diff Viewer

Every proposed fix can be reviewed through a before/after diff.

Developers can inspect exactly what changed before approving the solution.

### 🧪 Test Lab

The Test Lab provides a workflow for:

* Generating regression tests
* Reviewing test cases
* Preparing tests for execution
* Tracking test status
* Recording verification results

### ✅ Verification

The verification workflow tracks whether the proposed fix addresses the original issue.

The session provides a traceable timeline from:

```text
Issue
  ↓
Analysis
  ↓
Root Cause
  ↓
Patch
  ↓
Tests
  ↓
Verification
```

### 📋 PR Summary

PatchPilot can generate a structured pull-request summary from the debugging session, including:

* Problem
* Root cause
* Changes made
* Tests
* Verification status
* Files affected

### 🕒 Activity Timeline

Every major workflow action can be represented in a chronological activity timeline, providing an audit trail of the debugging session.

### 📈 Workflow Impact

PatchPilot displays session-derived workflow metrics rather than fabricated ROI claims.

Examples include:

* Investigation duration
* Number of affected files
* Tests generated
* Verification progress
* Agent/workflow activity

# 🛒 ShopStack Demo

PatchPilot includes **ShopStack**, a small e-commerce cart service designed specifically to demonstrate the complete debugging workflow.

### Intentional Bug

When the final item is removed from the cart, the updated empty-cart state is not persisted correctly.

A subsequent read can therefore return stale pre-removal data, resulting in an incorrect cart state and potentially incorrect totals.

### Bug Location

```text
shopstack-demo/
├── src/
│   └── cart/
│       └── cartService.js
└── tests/
    └── cart.test.js
```

### Demo Workflow

The ShopStack bug can be taken through the complete PatchPilot workflow:

```text
BUG REPORT
     ↓
REPRODUCE
     ↓
ANALYZE
     ↓
ROOT CAUSE
     ↓
GENERATE FIX
     ↓
GENERATE TEST
     ↓
VERIFY
```

The included `DemoProvider` provides deterministic analysis and fix-generation responses for this specific demonstration, allowing the complete workflow to run without requiring external AI credentials.

# 🏗️ Architecture

PatchPilot currently follows a modular Next.js architecture.

```text
PatchPilot
│
├── app/
│   └── Page components & routes
│
├── components/
│   └── Reusable UI components
│
├── lib/
│   ├── types.ts
│   │   └── Core data models
│   │
│   ├── store.ts
│   │   └── localStorage persistence
│   │
│   ├── demo-data.ts
│   │   └── ShopStack fixtures
│   │
│   ├── ai-provider.ts
│   │   └── AI provider abstraction
│   │
│   └── run-demo.ts
│       └── Demo workflow seeder
│
└── shopstack-demo/
    ├── src/
    └── tests/
```

For a deeper architecture breakdown, see:

`docs/ARCHITECTURE.md`

# 🛠️ Tech Stack

| Layer               | Technology                          |
| ------------------- | ----------------------------------- |
| Framework           | Next.js 16 App Router               |
| Language            | TypeScript 5                        |
| Styling             | Tailwind CSS v4                     |
| Icons               | Lucide React                        |
| State / Persistence | Browser localStorage                |
| Development Build   | Turbopack                           |
| Demo Application    | ShopStack                           |
| AI Layer            | Provider abstraction + DemoProvider |


# ⚙️ Getting Started

## Prerequisites

Make sure you have:

* Node.js 18+
* npm 9+

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd patchpilot
```

Install dependencies:

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

# 🧪 Testing the ShopStack Bug

The ShopStack demo contains Jest test scenarios for the cart behavior.

Navigate to the demo:

```bash
cd shopstack-demo
```

Install Jest:

```bash
npm init -y
npm install --save-dev jest
```

Run the tests:

```bash
npx jest tests/cart.test.js
```

The regression test is designed around the original buggy behavior and should demonstrate the difference after the proposed fix is applied.

# 🔐 Environment Variables

PatchPilot can run in demo mode without external AI credentials.

Create a `.env.local` file when configuring an external provider:

```env
# Default demo provider
AI_PROVIDER=demo

# External provider configuration
# AI_PROVIDER=external
# AI_PROVIDER_API_KEY=your-key-here
# AI_PROVIDER_ENDPOINT=https://your-provider.com/v1
# AI_PROVIDER_MODEL=your-model-id
```

> **Never commit `.env.local` or API keys to source control.**

Make sure `.env.local` is included in `.gitignore`.

# 🤖 AI Provider Architecture

PatchPilot uses a provider abstraction so the workflow is not tightly coupled to a single AI backend.

```text
                PatchPilot
                    │
                    ▼
             AI Provider Layer
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     DemoProvider       External Provider
```

### DemoProvider

The current implementation uses deterministic responses for the ShopStack demonstration.

This allows the complete product workflow to be demonstrated without external credentials.

### External Provider

The provider abstraction is designed so that an external AI backend can be integrated without restructuring the entire application.

# 🧩 IBM Bob Usage

**IBM Bob IDE was used as the primary development environment for PatchPilot.**

Bob contributed to the development workflow across areas including:

* Application structure
* UI development
* Debugging workflow
* Component implementation
* Documentation
* Demo preparation

Detailed usage information is available in:

`docs/IBM_BOB_USAGE.md`

# 🎬 Demo

PatchPilot includes a guided demo workflow.

### Quick Start

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Then:

1. Click **Run Demo**
2. Open the ShopStack issue
3. Start the analysis
4. Review the root cause
5. Inspect the proposed code diff
6. Review generated tests
7. Complete verification
8. Generate the PR summary

For the complete walkthrough, see:

`docs/DEMO.md`

# ⚠️ Current Limitations

PatchPilot is currently a focused prototype and intentionally keeps some integrations simulated.

### AI Backend

The current demo uses `DemoProvider` rather than a live external AI backend.

### Persistence

Application state currently uses browser `localStorage`.

A production multi-user deployment would require server-side persistence.

### Demo Scope

The deterministic analysis and fix generation are currently tailored to the ShopStack cart bug.

### Test Execution

The current Test Lab workflow demonstrates test generation and tracking. Full production test execution would require integration with a real test runner.

### Git Integration

The current **Apply Fix** workflow updates application state for the demonstration.

It does not perform real Git commits, branches, or pull requests.

### Repository Integration

The current version does not yet connect directly to GitHub or GitLab repositories.

# 🚀 Future Roadmap

PatchPilot is designed to evolve from a structured debugging workspace into a more autonomous engineering workflow.

### AI & Agentic Capabilities

* [ ] Live AI provider integration
* [ ] Specialized investigation agent
* [ ] Automated root-cause analysis
* [ ] Fix-generation agent
* [ ] Test-generation agent
* [ ] Independent verification agent
* [ ] Multi-agent orchestration

### Developer Workflow

* [ ] GitHub integration
* [ ] GitLab integration
* [ ] Real branch and commit creation
* [ ] Pull-request creation
* [ ] Real test-runner integration
* [ ] Repository indexing

### Platform

* [ ] Server-side persistence
* [ ] PostgreSQL / SQLite backend
* [ ] Multi-user collaboration
* [ ] Historical analytics
* [ ] Metrics export
* [ ] Team workspaces

# 📚 Documentation

Additional documentation:

| Document                | Description               |
| ----------------------- | ------------------------- |
| `docs/ARCHITECTURE.md`  | System architecture       |
| `docs/API.md`           | API reference             |
| `docs/DEMO.md`          | Demo walkthrough          |
| `docs/IBM_BOB_USAGE.md` | IBM Bob development usage |

# 🔒 Security

PatchPilot follows basic development security practices:

* API keys are stored through environment variables
* `.env.local` should never be committed
* No credentials should be hardcoded
* Repository credentials should never be exposed in client-side code
* Sensitive user or repository information should not be included in demo data

# 🌟 Vision

Debugging shouldn't feel like jumping between ten different tools.

PatchPilot aims to make the engineering workflow more connected:

```text
Understand the problem.
        ↓
Find the cause.
        ↓
Propose the fix.
        ↓
Test the change.
        ↓
Verify the result.
```

**PatchPilot — From Bug Report to Verified Fix.**
