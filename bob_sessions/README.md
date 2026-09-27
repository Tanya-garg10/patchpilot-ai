# bob_sessions — IBM Bob IDE Task Session Evidence

## Purpose

This directory stores **actual IBM Bob IDE Task Session Summary screenshots** captured directly from the Bob IDE during development of PatchPilot.

These screenshots are evidence of real Bob IDE usage and must be captured manually from the Bob IDE interface.

---

## How to Capture Task Session Summaries

1. Open **IBM Bob IDE** (the chat/agent interface)
2. Open the **Tasks** panel
3. Select the relevant **PatchPilot task** (e.g., Task 01 — Project Foundation)
4. Open the **task header** or task summary panel
5. View the **Session Consumption Summary** (shows tokens, steps, tool calls, etc.)
6. **Capture a screenshot** (PNG) of the summary
7. Save it using the filename listed below

---

## Expected Screenshot Files

Place your captured screenshots here using these exact filenames:

| Filename | Bob Task |
|----------|----------|
| `patchpilot_task01_foundation_summary.png` | Task 01 — Project Foundation |
| `patchpilot_task02_demo_bug_summary.png` | Task 02 — ShopStack Demo Bug |
| `patchpilot_task03_debug_workspace_summary.png` | Task 03 — Dashboard |
| `patchpilot_task04_ai_analysis_summary.png` | Task 04 — Debug Workspace |
| `patchpilot_task05_fix_diff_summary.png` | Task 05 — Root Cause Analysis |
| `patchpilot_task06_test_lab_summary.png` | Task 06 — Fix and Code Diff |
| `patchpilot_task07_verification_summary.png` | Task 07 — Test Lab |
| `patchpilot_task08_workflow_impact_summary.png` | Task 08 — Verification |
| `patchpilot_task09_pr_summary_summary.png` | Task 09 — Workflow Impact & PR Summary |
| `patchpilot_task10_final_audit_summary.png` | Task 10 — Final Audit |

---

## Important Notes

- **Do NOT add fabricated screenshots** to this directory
- **Do NOT add generated images** that were not captured from Bob IDE
- Every screenshot must be a genuine capture from the Bob IDE Task Session Summary panel
- Screenshots will show actual token consumption, tool calls, and task metadata from Bob IDE

---

## What a Session Summary Shows

A Bob Task Session Summary typically includes:
- Task title and description
- Number of tool calls made
- Tokens consumed (input / output)
- Files created or modified
- Duration
- Completion status

These metrics are real evidence of IBM Bob IDE usage during PatchPilot development.
