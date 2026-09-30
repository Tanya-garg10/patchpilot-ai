# GTM Strategy — PatchPilot

## Product Positioning

**Primary:** PatchPilot turns software issues into verified fixes through an autonomous AI engineering workflow.

**Secondary:** Investigate. Fix. Test. Verify.

**Differentiation:** PatchPilot is not a chatbot or a code completion tool. It is a multi-agent workflow system where specialized AI agents collaborate to resolve engineering issues while keeping developers in control at every step.

---

## Target Customer Segments

### 1. Startup Engineering Teams

**Pain:** Debugging overhead consumes velocity. Small teams context-switch between issue trackers, editors, and test runners constantly.

**Value:** PatchPilot automates the investigation and verification workflow, reducing mean time to resolution.

**Plan:** Pro ($29/month)

---

### 2. SaaS Companies

**Pain:** Regression risk with each release. Manual debugging doesn't scale with codebase growth.

**Value:** Automated regression test generation per fix. Full audit trail from issue to verified patch.

**Plan:** Team ($99/month)

---

### 3. Software Agencies

**Pain:** Repetitive maintenance work across many client codebases.

**Value:** Accelerate repetitive debugging cycles. Produce verifiable evidence of the investigation.

**Plan:** Team ($99/month)

---

### 4. QA Teams

**Pain:** Manual regression coverage gaps. Writing tests for every bug fix is time-consuming.

**Value:** Test Agent generates regression tests automatically for every approved fix.

**Plan:** Team ($99/month)

---

### 5. Open Source Maintainers

**Pain:** Issue triage at scale. Difficult to investigate and verify community-submitted bugs efficiently.

**Value:** Rapid investigation with root cause evidence. Generates PR-ready summaries with full context.

**Plan:** Developer (Free)

---

### 6. Enterprise Engineering

**Pain:** Compliance requirements, audit trails, security review of AI-assisted changes.

**Value:** Full workflow documentation, human approval gates, no auto-applied code changes.

**Plan:** Enterprise (Custom)

---

## Proposed Pricing

> **Note:** These are proposed pricing concepts. They are not claimed market prices or validated figures.

| Plan | Price | Target |
|------|-------|--------|
| Developer | $0 | Individual developers and open source |
| Pro | $29/month | Small engineering teams |
| Team | $99/month | Growing SaaS and agency teams |
| Enterprise | Custom | Large organizations with compliance needs |

---

## Key Buying Triggers

- Engineering team loses significant time to debugging each sprint
- Recent regression incident caused customer impact
- Growing backlog of unresolved bugs
- Onboarding new developers who need guided debugging workflows
- QA looking to improve regression coverage without manual test writing

---

## Competitive Differentiation

PatchPilot is not positioned against:
- GitHub Copilot (code completion)
- Linear / Jira (issue tracking)
- Sentry / Datadog (error monitoring)

PatchPilot is positioned as the **workflow layer between issue detection and verified resolution** — connecting investigation, patching, testing, and verification in one auditable workflow.

---

## Demo Strategy

The 3-minute demo with ShopStack BUG-1042 demonstrates the complete workflow:

1. **0:00–0:20** — Open PatchPilot, show Engineering Command Center
2. **0:20–0:45** — Open BUG-1042, show cart issue reproduction
3. **0:45–1:15** — Start Investigator Agent, show root cause evidence
4. **1:15–1:40** — Show proposed patch diff, explain human approval gate
5. **1:40–2:10** — Approve patch, run Test Agent, show regression tests
6. **2:10–2:35** — Run Verification Agent, show VERIFIED result
7. **2:35–2:50** — Show PR Summary
8. **2:50–3:00** — Business positioning close

See [`docs/DEMO.md`](./DEMO.md) for the full walkthrough.

---

## Evorozen Neural Pulse Integration Value

If Neural Pulse is integrated as the primary intelligence layer:

- **Contextual memory** across sessions enables learning from past investigations
- **Repository intelligence** can be cached and reused across issues in the same codebase
- **Routing** between specialized agents can be optimized based on issue type
- **Engineering knowledge** grounding reduces hallucination risk in fix generation

This positions PatchPilot as a Neural Pulse showcase: demonstrating practical multi-agent engineering workflows powered by the Evorozen intelligence platform.
