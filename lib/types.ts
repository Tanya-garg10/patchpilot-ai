// ============================================================
// PatchPilot — Core TypeScript Models
// ============================================================

export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'csharp'
  | 'php'
  | 'ruby'
  | 'other';

export type Framework =
  | 'react'
  | 'next'
  | 'express'
  | 'fastapi'
  | 'spring'
  | 'rails'
  | 'laravel'
  | 'django'
  | 'other';

export type SessionStatus =
  | 'open'
  | 'analyzing'
  | 'analyzed'
  | 'fix_ready'
  | 'fix_applied'
  | 'testing'
  | 'verified'
  | 'closed';

export type TestStatus =
  | 'suggested'
  | 'ready'
  | 'executed'
  | 'passed'
  | 'failed'
  | 'needs_verification';

export type ActivityEventType =
  | 'bug_report_created'
  | 'analysis_started'
  | 'root_cause_identified'
  | 'fix_generated'
  | 'diff_reviewed'
  | 'fix_applied'
  | 'tests_generated'
  | 'tests_executed'
  | 'verification_completed'
  | 'pr_summary_created'
  | 'session_created'
  | 'session_closed';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'needs_verification'
  | 'failed';

// ----------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  language: Language;
  framework: Framework;
  createdAt: string;
}

export interface SuspiciousLine {
  file: string;
  line: number;
  code: string;
  reason: string;
}

export interface FileDiff {
  file: string;
  before: string;
  after: string;
  explanation: string;
}

export interface AnalysisResult {
  rootCause: string;
  confidence: number; // 0-100
  affectedFiles: string[];
  suspiciousLines: SuspiciousLine[];
  explanation: string;
  recommendedFix: string;
  risks: string[];
  edgeCases: string[];
}

export interface GeneratedFix {
  problem: string;
  rootCause: string;
  filesToChange: string[];
  explanation: string;
  risk: string;
  edgeCases: string[];
  verificationPlan: string[];
  diffs: FileDiff[];
}

export interface DebugSession {
  id: string;
  projectId: string;
  title: string;
  bugReport: string;
  expectedBehavior: string;
  actualBehavior: string;
  reproductionSteps: string[];
  status: SessionStatus;
  analysis: AnalysisResult | null;
  generatedFix: GeneratedFix | null;
  fixApplied: boolean;
  appliedAt: string | null;
  changedFiles: string[];
  verificationStatus: VerificationStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  sessionId: string;
  name: string;
  description: string;
  code: string;
  status: TestStatus;
  result: string | null;
  executedAt: string | null;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  sessionId: string | null;
  projectId: string | null;
  type: ActivityEventType;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface WorkflowMetric {
  id: string;
  sessionId: string;
  metric: string;
  value: string;
  label: string;
  isDemo: boolean;
}

// ----------------------------------------------------------------
// App State slices (used in Zustand / context)
// ----------------------------------------------------------------

export interface AppState {
  projects: Project[];
  sessions: DebugSession[];
  testCases: TestCase[];
  activity: ActivityEvent[];
  metrics: WorkflowMetric[];
}
