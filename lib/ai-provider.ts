// ============================================================
// PatchPilot — AI Provider Abstraction
// ============================================================

import { AnalysisResult, GeneratedFix, DebugSession } from './types';
import { DEMO_ANALYSIS, DEMO_FIX, DEMO_BUG_SESSION_ID } from './demo-data';

export interface AIProvider {
  name: string;
  analyze(session: DebugSession, sourceFiles: Record<string, string>): Promise<AnalysisResult>;
  generateFix(session: DebugSession, analysis: AnalysisResult): Promise<GeneratedFix>;
}

// ----------------------------------------------------------------
// DemoProvider — deterministic responses for ShopStack Demo
// ----------------------------------------------------------------

export class DemoProvider implements AIProvider {
  name = 'Demo (ShopStack)';

  async analyze(
    session: DebugSession,
    _sourceFiles: Record<string, string>
  ): Promise<AnalysisResult> {
    // Simulate network latency
    await delay(1800);

    if (session.id === DEMO_BUG_SESSION_ID || session.projectId === 'shopstack-demo-001') {
      return DEMO_ANALYSIS;
    }

    // Generic fallback for non-demo sessions
    return genericAnalysis(session);
  }

  async generateFix(
    session: DebugSession,
    _analysis: AnalysisResult
  ): Promise<GeneratedFix> {
    await delay(1400);

    if (session.id === DEMO_BUG_SESSION_ID || session.projectId === 'shopstack-demo-001') {
      return DEMO_FIX;
    }

    return genericFix(session, _analysis);
  }
}

// ----------------------------------------------------------------
// External AI Provider placeholder
// Swap this implementation when a real provider is configured.
// Configure via environment variables — never hardcode credentials.
// ----------------------------------------------------------------

export class ExternalAIProvider implements AIProvider {
  name = 'External AI';

  async analyze(
    session: DebugSession,
    sourceFiles: Record<string, string>
  ): Promise<AnalysisResult> {
    // TODO: Implement external AI provider
    // const apiKey = process.env.AI_PROVIDER_API_KEY;
    // const endpoint = process.env.AI_PROVIDER_ENDPOINT;
    // const model = process.env.AI_PROVIDER_MODEL;
    // if (!apiKey || !endpoint) throw new Error('External AI provider not configured');
    throw new Error(
      'External AI provider not yet configured. Set AI_PROVIDER_API_KEY and AI_PROVIDER_ENDPOINT in your environment.'
    );
  }

  async generateFix(
    _session: DebugSession,
    _analysis: AnalysisResult
  ): Promise<GeneratedFix> {
    throw new Error('External AI provider not yet configured.');
  }
}

// ----------------------------------------------------------------
// Provider factory — resolves from environment
// ----------------------------------------------------------------

export function getAIProvider(): AIProvider {
  if (typeof window !== 'undefined') {
    // Client-side: always use DemoProvider
    return new DemoProvider();
  }

  const providerType = process.env.AI_PROVIDER ?? 'demo';
  switch (providerType) {
    case 'external':
      return new ExternalAIProvider();
    case 'demo':
    default:
      return new DemoProvider();
  }
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function genericAnalysis(session: DebugSession): AnalysisResult {
  return {
    rootCause: `Analysis of "${session.title}" — root cause requires manual investigation or an external AI provider.`,
    confidence: 0,
    affectedFiles: [],
    suspiciousLines: [],
    explanation:
      'This is a placeholder analysis from the DemoProvider for non-ShopStack sessions. Configure an external AI provider for real analysis.',
    recommendedFix: 'Review the code manually and apply appropriate changes.',
    risks: ['Cannot determine risks without analysis'],
    edgeCases: ['Cannot determine edge cases without analysis'],
  };
}

function genericFix(session: DebugSession, analysis: AnalysisResult): GeneratedFix {
  return {
    problem: session.bugReport,
    rootCause: analysis.rootCause,
    filesToChange: analysis.affectedFiles,
    explanation: 'No fix generated — configure an external AI provider for real fix generation.',
    risk: 'Unknown',
    edgeCases: analysis.edgeCases,
    verificationPlan: ['Manual review required'],
    diffs: [],
  };
}
