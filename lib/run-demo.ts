'use client';

// ============================================================
// PatchPilot — runDemo()
// Seeds the ShopStack demo session into localStorage.
// BUG-1042: Cart quantity resets after navigating back to cart.
// ============================================================

import {
  saveProject,
  getProjects,
  getSessions,
  saveSession,
  addActivity,
  createTestCase,
} from './store';
import {
  SHOPSTACK_PROJECT,
  SHOPSTACK_PROJECT_ID,
  DEMO_BUG_SESSION_ID,
  DEMO_BUG_REPORT,
  DEMO_TEST_CASES,
} from './demo-data';
import { DebugSession } from './types';

export async function runDemo(): Promise<string> {
  // Ensure ShopStack project exists
  const projects = getProjects();
  if (!projects.find((p) => p.id === SHOPSTACK_PROJECT_ID)) {
    saveProject(SHOPSTACK_PROJECT);
  }

  // Check if demo session already exists
  const existing = getSessions().find((s) => s.id === DEMO_BUG_SESSION_ID);
  if (existing) {
    return DEMO_BUG_SESSION_ID;
  }

  // Create the demo session
  const session: DebugSession = {
    ...DEMO_BUG_REPORT,
    id: DEMO_BUG_SESSION_ID,
  };
  saveSession(session);

  addActivity({
    sessionId: DEMO_BUG_SESSION_ID,
    projectId: SHOPSTACK_PROJECT_ID,
    type: 'bug_report_created',
    description: 'ShopStack BUG-1042: "Cart quantity resets after navigating back to the cart"',
    metadata: { demo: true, bugId: 'BUG-1042' },
  });

  addActivity({
    sessionId: DEMO_BUG_SESSION_ID,
    projectId: SHOPSTACK_PROJECT_ID,
    type: 'analysis_started',
    description: 'Investigator Agent: scanning repository for root cause evidence',
    metadata: { demo: true, agent: 'investigator' },
  });

  // Seed suggested test cases
  for (const tc of DEMO_TEST_CASES) {
    createTestCase(DEMO_BUG_SESSION_ID, tc.name, tc.description, tc.code);
  }

  addActivity({
    sessionId: DEMO_BUG_SESSION_ID,
    projectId: SHOPSTACK_PROJECT_ID,
    type: 'tests_generated',
    description: `Test Agent: ${DEMO_TEST_CASES.length} regression tests generated for BUG-1042`,
    metadata: { demo: true, agent: 'test', count: DEMO_TEST_CASES.length },
  });

  return DEMO_BUG_SESSION_ID;
}
