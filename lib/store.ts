'use client';

// ============================================================
// PatchPilot — Client-side State Store (localStorage)
// ============================================================

import { v4 as uuid } from 'uuid';
import {
  Project,
  DebugSession,
  TestCase,
  ActivityEvent,
  WorkflowMetric,
  SessionStatus,
  AnalysisResult,
  GeneratedFix,
  VerificationStatus,
} from './types';

const STORAGE_KEYS = {
  PROJECTS: 'pp_projects',
  SESSIONS: 'pp_sessions',
  TEST_CASES: 'pp_test_cases',
  ACTIVITY: 'pp_activity',
  METRICS: 'pp_metrics',
} as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded – silently ignore
  }
}

// ----------------------------------------------------------------
// Projects
// ----------------------------------------------------------------

export function getProjects(): Project[] {
  return load<Project[]>(STORAGE_KEYS.PROJECTS, []);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  save(STORAGE_KEYS.PROJECTS, projects);
}

export function deleteProject(id: string): void {
  save(
    STORAGE_KEYS.PROJECTS,
    getProjects().filter((p) => p.id !== id)
  );
}

// ----------------------------------------------------------------
// Debug Sessions
// ----------------------------------------------------------------

export function getSessions(): DebugSession[] {
  return load<DebugSession[]>(STORAGE_KEYS.SESSIONS, []);
}

export function getSession(id: string): DebugSession | undefined {
  return getSessions().find((s) => s.id === id);
}

export function saveSession(session: DebugSession): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = { ...session, updatedAt: new Date().toISOString() };
  else sessions.push(session);
  save(STORAGE_KEYS.SESSIONS, sessions);
}

export function createSession(
  projectId: string,
  title: string,
  bugReport: string,
  expectedBehavior: string,
  actualBehavior: string,
  reproductionSteps: string[]
): DebugSession {
  const now = new Date().toISOString();
  const session: DebugSession = {
    id: uuid(),
    projectId,
    title,
    bugReport,
    expectedBehavior,
    actualBehavior,
    reproductionSteps,
    status: 'open',
    analysis: null,
    generatedFix: null,
    fixApplied: false,
    appliedAt: null,
    changedFiles: [],
    verificationStatus: null,
    createdAt: now,
    updatedAt: now,
  };
  saveSession(session);
  addActivity({
    sessionId: session.id,
    projectId,
    type: 'bug_report_created',
    description: `Bug report created: "${title}"`,
    metadata: {},
  });
  return session;
}

export function updateSessionStatus(id: string, status: SessionStatus): void {
  const session = getSession(id);
  if (!session) return;
  saveSession({ ...session, status });
}

export function applyAnalysis(id: string, analysis: AnalysisResult): void {
  const session = getSession(id);
  if (!session) return;
  saveSession({ ...session, analysis, status: 'analyzed' });
}

export function applyFix(id: string, fix: GeneratedFix): void {
  const session = getSession(id);
  if (!session) return;
  saveSession({
    ...session,
    generatedFix: fix,
    fixApplied: true,
    appliedAt: new Date().toISOString(),
    changedFiles: fix.filesToChange,
    status: 'fix_applied',
  });
  addActivity({
    sessionId: id,
    projectId: session.projectId,
    type: 'fix_applied',
    description: `Fix applied to ${fix.filesToChange.length} file(s)`,
    metadata: { files: fix.filesToChange },
  });
}

export function setVerification(id: string, status: VerificationStatus): void {
  const session = getSession(id);
  if (!session) return;
  saveSession({ ...session, verificationStatus: status, status: 'verified' });
  addActivity({
    sessionId: id,
    projectId: session.projectId,
    type: 'verification_completed',
    description: `Verification status: ${status}`,
    metadata: { status },
  });
}

// ----------------------------------------------------------------
// Test Cases
// ----------------------------------------------------------------

export function getTestCases(sessionId?: string): TestCase[] {
  const all = load<TestCase[]>(STORAGE_KEYS.TEST_CASES, []);
  if (!sessionId) return all;
  return all.filter((t) => t.sessionId === sessionId);
}

export function saveTestCase(tc: TestCase): void {
  const all = getTestCases();
  const idx = all.findIndex((t) => t.id === tc.id);
  if (idx >= 0) all[idx] = tc;
  else all.push(tc);
  save(STORAGE_KEYS.TEST_CASES, all);
}

export function createTestCase(
  sessionId: string,
  name: string,
  description: string,
  code: string
): TestCase {
  const tc: TestCase = {
    id: uuid(),
    sessionId,
    name,
    description,
    code,
    status: 'suggested',
    result: null,
    executedAt: null,
    createdAt: new Date().toISOString(),
  };
  saveTestCase(tc);
  return tc;
}

export function executeTestCase(id: string, passed: boolean, result: string): void {
  const all = getTestCases();
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) return;
  all[idx] = {
    ...all[idx],
    status: passed ? 'passed' : 'failed',
    result,
    executedAt: new Date().toISOString(),
  };
  save(STORAGE_KEYS.TEST_CASES, all);
}

// ----------------------------------------------------------------
// Activity
// ----------------------------------------------------------------

export function getActivity(sessionId?: string): ActivityEvent[] {
  const all = load<ActivityEvent[]>(STORAGE_KEYS.ACTIVITY, []);
  if (!sessionId) return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addActivity(
  event: Omit<ActivityEvent, 'id' | 'createdAt'>
): ActivityEvent {
  const all = load<ActivityEvent[]>(STORAGE_KEYS.ACTIVITY, []);
  const ev: ActivityEvent = {
    ...event,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  all.push(ev);
  save(STORAGE_KEYS.ACTIVITY, all);
  return ev;
}

// ----------------------------------------------------------------
// Workflow Metrics
// ----------------------------------------------------------------

export function getMetrics(sessionId?: string): WorkflowMetric[] {
  const all = load<WorkflowMetric[]>(STORAGE_KEYS.METRICS, []);
  if (!sessionId) return all;
  return all.filter((m) => m.sessionId === sessionId);
}

export function saveMetric(metric: WorkflowMetric): void {
  const all = getMetrics();
  const idx = all.findIndex((m) => m.id === metric.id);
  if (idx >= 0) all[idx] = metric;
  else all.push(metric);
  save(STORAGE_KEYS.METRICS, all);
}

// ----------------------------------------------------------------
// Seed / clear
// ----------------------------------------------------------------

export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach((k) => {
    if (typeof window !== 'undefined') localStorage.removeItem(k);
  });
}
