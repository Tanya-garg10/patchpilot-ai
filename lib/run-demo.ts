'use client';

// ============================================================
// PatchPilot — runDemo()
// Seeds the ShopStack demo session into localStorage.
// ============================================================

import { v4 as uuid } from 'uuid';
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
    description: 'ShopStack demo bug report created: "Cart total becomes negative after removing the last item"',
    metadata: { demo: true },
  });

  // Seed suggested test cases
  for (const tc of DEMO_TEST_CASES) {
    createTestCase(DEMO_BUG_SESSION_ID, tc.name, tc.description, tc.code);
  }

  return DEMO_BUG_SESSION_ID;
}
