// ============================================================
// PatchPilot — AI Provider Abstraction
// Supports: DemoProvider | EvorozenProvider | ExternalAIProvider
// Configure via environment variables — never hardcode credentials.
// ============================================================

import { AnalysisResult, GeneratedFix, DebugSession } from './types';
import { DEMO_ANALYSIS, DEMO_FIX, DEMO_BUG_SESSION_ID } from './demo-data';

export interface AIProvider {
  name: string;
  mode: 'demo' | 'evorozen' | 'external';
  analyze(session: DebugSession, sourceFiles: Record<string, string>): Promise<AnalysisResult>;
  generateFix(session: DebugSession, analysis: AnalysisResult): Promise<GeneratedFix>;
}

// ----------------------------------------------------------------
// DemoProvider — deterministic responses for ShopStack Demo
// Never claims to be a real AI call.
// ----------------------------------------------------------------

export class DemoProvider implements AIProvider {
  name = 'Demo (ShopStack)';
  mode = 'demo' as const;

  async analyze(
    session: DebugSession,
    _sourceFiles: Record<string, string>
  ): Promise<AnalysisResult> {
    // Simulate realistic latency
    await delay(1800);

    if (session.id === DEMO_BUG_SESSION_ID || session.projectId === 'shopstack-demo-001') {
      return DEMO_ANALYSIS;
    }

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
// EvorozenProvider — Evorozen Neural Pulse integration
//
// Architecture: This provider routes all AI operations through the
// Evorozen Neural Pulse intelligence/context layer.
//
// Neural Pulse serves as:
//   • Agent context management (issue history, session state)
//   • Repository investigation memory
//   • Workflow routing between specialized agents
//   • Structured engineering knowledge base
//
// Required env vars:
//   EVOROZEN_API_KEY     — Neural Pulse API key
//   EVOROZEN_ENDPOINT    — Neural Pulse API endpoint
//   EVOROZEN_MODEL       — Model identifier (default: neural-pulse-v1)
//
// If credentials are not configured, EvorozenProvider falls back
// to DemoProvider and logs a clear warning.
// ----------------------------------------------------------------

export class EvorozenProvider implements AIProvider {
  name = 'Evorozen Neural Pulse';
  mode = 'evorozen' as const;

  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    this.apiKey   = process.env.EVOROZEN_API_KEY ?? '';
    this.endpoint = process.env.EVOROZEN_ENDPOINT ?? 'https://api.evorozen.com/v1';
    this.model    = process.env.EVOROZEN_MODEL ?? 'neural-pulse-v1';
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.endpoint);
  }

  async analyze(
    session: DebugSession,
    sourceFiles: Record<string, string>
  ): Promise<AnalysisResult> {
    if (!this.isConfigured()) {
      console.warn(
        '[EvorozenProvider] EVOROZEN_API_KEY not configured — falling back to DemoProvider.'
      );
      return new DemoProvider().analyze(session, sourceFiles);
    }

    // ── Neural Pulse integration point ────────────────────────
    // When credentials are available, submit to the Neural Pulse
    // investigation endpoint. The prompt below is illustrative —
    // adapt to the actual Neural Pulse API contract.
    //
    // const response = await fetch(`${this.endpoint}/investigate`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: this.model,
    //     session: {
    //       id: session.id,
    //       title: session.title,
    //       bugReport: session.bugReport,
    //       expectedBehavior: session.expectedBehavior,
    //       actualBehavior: session.actualBehavior,
    //       reproductionSteps: session.reproductionSteps,
    //     },
    //     sourceFiles,
    //     task: 'root_cause_analysis',
    //     contextMode: 'neural_pulse',
    //   }),
    // });
    // if (!response.ok) throw new Error(`Evorozen API error: ${response.status}`);
    // const data = await response.json();
    // return mapNeuralPulseAnalysis(data);
    // ─────────────────────────────────────────────────────────

    throw new Error(
      '[EvorozenProvider] API contract not yet finalized. ' +
      'Ensure EVOROZEN_API_KEY and EVOROZEN_ENDPOINT are set and the Neural Pulse endpoint is reachable.'
    );
  }

  async generateFix(
    session: DebugSession,
    analysis: AnalysisResult
  ): Promise<GeneratedFix> {
    if (!this.isConfigured()) {
      console.warn(
        '[EvorozenProvider] EVOROZEN_API_KEY not configured — falling back to DemoProvider.'
      );
      return new DemoProvider().generateFix(session, analysis);
    }

    // ── Neural Pulse fix generation endpoint ──────────────────
    // See analyze() above for integration pattern.
    // ─────────────────────────────────────────────────────────

    throw new Error(
      '[EvorozenProvider] API contract not yet finalized. ' +
      'Ensure EVOROZEN_API_KEY and EVOROZEN_ENDPOINT are set.'
    );
  }
}

// ----------------------------------------------------------------
// External AI Provider placeholder
// Swap this implementation when a real LLM provider is configured.
// ----------------------------------------------------------------

export class ExternalAIProvider implements AIProvider {
  name = 'External AI';
  mode = 'external' as const;

  async analyze(
    _session: DebugSession,
    _sourceFiles: Record<string, string>
  ): Promise<AnalysisResult> {
    const apiKey   = process.env.AI_PROVIDER_API_KEY;
    const endpoint = process.env.AI_PROVIDER_ENDPOINT;
    if (!apiKey || !endpoint) {
      throw new Error('External AI provider not configured. Set AI_PROVIDER_API_KEY and AI_PROVIDER_ENDPOINT.');
    }
    throw new Error('External AI provider integration not yet implemented.');
  }

  async generateFix(
    _session: DebugSession,
    _analysis: AnalysisResult
  ): Promise<GeneratedFix> {
    throw new Error('External AI provider integration not yet implemented.');
  }
}

// ----------------------------------------------------------------
// Provider factory — resolves from environment
//
// AI_PROVIDER=demo      → DemoProvider (default, no credentials required)
// AI_PROVIDER=evorozen  → EvorozenProvider (requires EVOROZEN_API_KEY)
// AI_PROVIDER=external  → ExternalAIProvider (requires AI_PROVIDER_API_KEY)
// ----------------------------------------------------------------

export function getAIProvider(): AIProvider {
  if (typeof window !== 'undefined') {
    // Client-side: always use DemoProvider for security
    return new DemoProvider();
  }

  const providerType = process.env.AI_PROVIDER ?? 'demo';
  switch (providerType) {
    case 'evorozen':
      return new EvorozenProvider();
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
    rootCause: `Analysis of "${session.title}" — root cause requires manual investigation or a configured AI provider.`,
    confidence: 0,
    affectedFiles: [],
    suspiciousLines: [],
    explanation:
      'This is a placeholder from the DemoProvider for non-ShopStack sessions. Configure an AI provider for real analysis.',
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
    explanation: 'No fix generated — configure an AI provider for real fix generation.',
    risk: 'Unknown',
    edgeCases: analysis.edgeCases,
    verificationPlan: ['Manual review required'],
    diffs: [],
  };
}
