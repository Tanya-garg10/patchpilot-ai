'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Wrench,
  FlaskConical,
  Shield,
  CheckCircle,
  Activity,
  ChevronRight,
  Cpu,
  Play,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getActivity, getSessions } from '@/lib/store';
import { formatRelative } from '@/lib/utils';
import { ActivityEvent, DebugSession } from '@/lib/types';

// ─────────────────────────────────────────────────────────────
// Agent definitions
// ─────────────────────────────────────────────────────────────

interface AgentDef {
  id: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  purpose: string;
  responsibilities: string[];
  output: string[];
  phase: string;
}

const AGENTS: AgentDef[] = [
  {
    id: 'investigator',
    name: 'INVESTIGATOR',
    label: 'Investigator Agent',
    icon: <Search size={18} />,
    color: '#00d4ff',
    phase: 'PHASE 1 — INVESTIGATION',
    purpose:
      'Parses the bug report, searches the repository, traces dependencies, analyzes reproduction steps, and identifies the most likely root cause with supporting evidence.',
    responsibilities: [
      'Parse issue and understand expected vs actual behavior',
      'Search repository files for relevant code',
      'Identify affected modules and components',
      'Trace dependency chains to the origin of the fault',
      'Analyze logs and reproduction information',
      'Collect and rank evidence by relevance',
      'Determine root cause with confidence score',
    ],
    output: [
      'Issue understanding summary',
      'Affected component list',
      'Evidence collection (references, lifecycle events, tests)',
      'Root cause statement',
      'Confidence score (0–100%)',
      'Recommended fix strategy',
    ],
  },
  {
    id: 'fix',
    name: 'FIX',
    label: 'Fix Agent',
    icon: <Wrench size={18} />,
    color: '#f97316',
    phase: 'PHASE 2 — FIX GENERATION',
    purpose:
      'Takes the root cause analysis and generates a minimal, reviewable patch. Shows before/after code and a unified diff. Always requires developer approval before applying.',
    responsibilities: [
      'Identify files requiring modification',
      'Generate a minimal, targeted patch',
      'Explain the technical reasoning for each change',
      'Show before/after code side-by-side',
      'Generate unified diff for review',
      'Estimate affected modules and regression risk',
      'Block on developer approval — never auto-apply',
    ],
    output: [
      'Proposed patch (unified diff)',
      'Before / After code comparison',
      'Change explanation',
      'Affected file list',
      'Risk assessment',
      'Edge case analysis',
    ],
  },
  {
    id: 'test',
    name: 'TEST',
    label: 'Test Agent',
    icon: <FlaskConical size={18} />,
    color: '#8b5cf6',
    phase: 'PHASE 3 — REGRESSION TESTING',
    purpose:
      'After the fix is approved, generates regression tests covering the original bug, adjacent behavior, and relevant edge cases. Tracks execution status for each test.',
    responsibilities: [
      'Generate test for original bug reproduction scenario',
      'Generate regression tests for adjacent behavior',
      'Generate edge-case tests based on code analysis',
      'Track execution status per test case',
      'Report pass / fail / needs-verification results',
      'Label all simulated executions clearly',
    ],
    output: [
      'Bug reproduction test (original scenario)',
      'Regression test suite',
      'Edge-case tests',
      'Execution status per test',
      'Test suite pass rate',
    ],
  },
  {
    id: 'verification',
    name: 'VERIFICATION',
    label: 'Verification Agent',
    icon: <Shield size={18} />,
    color: '#22c55e',
    phase: 'PHASE 4 — VERIFICATION',
    purpose:
      'Independently reviews the full workflow — was the issue resolved, did regression tests pass, were unrelated files changed, is the patch consistent with the root cause? Produces a final verification verdict.',
    responsibilities: [
      'Verify the original issue was addressed',
      'Confirm intended behavior was restored',
      'Verify all regression tests passed',
      'Check for unrelated file modifications',
      'Confirm patch is consistent with root cause analysis',
      'Produce final verification verdict with confidence score',
    ],
    output: [
      'VERIFICATION RESULT',
      'Original Issue: RESOLVED / UNRESOLVED',
      'Root Cause: CONFIRMED / UNCONFIRMED',
      'Code Patch: REVIEWED',
      'Regression Tests: N/N PASSED',
      'Unrelated Changes: NONE / DETECTED',
      'AI confidence score (clearly labeled as estimate)',
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    // Reads from localStorage on mount — setState in effect is intentional here
    /* eslint-disable react-hooks/set-state-in-effect */
    setActivity(getActivity().slice(0, 20));
    setSessions(getSessions());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const activeSession = sessions[sessions.length - 1] ?? null;

  // Map activity events to agent IDs
  function eventToAgent(type: string): string {
    if (type.startsWith('analysis') || type === 'bug_report_created') return 'investigator';
    if (type.startsWith('fix')) return 'fix';
    if (type.startsWith('tests')) return 'test';
    if (type.startsWith('verification')) return 'verification';
    return 'investigator';
  }

  // Derive agent status from sessions + activity
  function agentStatus(agentId: string): 'active' | 'ready' | 'waiting' | 'idle' {
    if (!activeSession) return 'idle';
    const s = activeSession;
    if (agentId === 'investigator') {
      if (s.status === 'analyzing') return 'active';
      if (s.analysis) return 'ready';
      return s.status === 'open' ? 'ready' : 'idle';
    }
    if (agentId === 'fix') {
      if (!s.analysis) return 'waiting';
      if (s.status === 'fix_applied') return 'ready';
      if (s.generatedFix) return 'ready';
      return 'ready';
    }
    if (agentId === 'test') {
      if (!s.fixApplied) return 'waiting';
      return 'ready';
    }
    if (agentId === 'verification') {
      if (s.status === 'verified') return 'ready';
      if (!s.fixApplied) return 'waiting';
      return 'ready';
    }
    return 'idle';
  }

  const STATUS_LABEL: Record<string, string> = {
    active: 'ACTIVE',
    ready: 'READY',
    waiting: 'WAITING',
    idle: 'IDLE',
  };
  const STATUS_COLOR: Record<string, string> = {
    active: '#00d4ff',
    ready: '#22c55e',
    waiting: '#eab308',
    idle: 'var(--text-muted)',
  };

  const selected = selectedAgent ? AGENTS.find(a => a.id === selectedAgent) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        <div>
          <div className="label-mono" style={{ marginBottom: 2 }}>AGENT ORCHESTRATOR</div>
          <h1 className="font-bold tracking-tight" style={{ fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AI Agents
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            Investigator · Fix · Test · Verification — autonomous engineering workflow
          </p>
        </div>
        {activeSession && (
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronRight size={12} />}
            onClick={() => router.push(`/sessions/${activeSession.id}`)}
          >
            Active Session
          </Button>
        )}
      </div>

      {/* Pipeline header */}
      <div
        className="px-5 py-3 flex items-center gap-0 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        <div className="label-mono mr-4" style={{ fontSize: 9 }}>WORKFLOW</div>
        {AGENTS.map((agent, i) => (
          <div key={agent.id} className="flex items-center">
            <button
              onClick={() => setSelectedAgent(a => a === agent.id ? null : agent.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors hover:bg-white/[0.03]"
              style={{
                border: `1px solid ${selectedAgent === agent.id ? agent.color + '60' : agent.color + '20'}`,
                background: selectedAgent === agent.id ? agent.color + '08' : 'transparent',
              }}
            >
              <div className="rounded-full" style={{ width: 5, height: 5, background: agent.color }} />
              <span className="font-mono font-semibold" style={{ fontSize: 9.5, color: agent.color, letterSpacing: '0.06em' }}>
                {agent.name}
              </span>
            </button>
            {i < AGENTS.length - 1 && (
              <ChevronRight size={10} style={{ color: 'var(--text-muted)', margin: '0 4px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex-1 overflow-auto p-5 space-y-4">

        {/* Agent cards */}
        <div className="grid grid-cols-4 gap-3">
          {AGENTS.map((agent) => {
            const status = agentStatus(agent.id);
            const statusColor = STATUS_COLOR[status];
            const isSelected = selectedAgent === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(a => a === agent.id ? null : agent.id)}
                className="text-left rounded-lg overflow-hidden transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? agent.color + '50' : 'var(--border)'}`,
                  borderTop: `2px solid ${agent.color}`,
                  boxShadow: isSelected ? `0 0 0 1px ${agent.color}20` : 'none',
                }}
              >
                <div className="p-4">
                  {/* Icon + name */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: agent.color + '10', color: agent.color }}
                    >
                      {agent.icon}
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="rounded-full animate-pulse-slow"
                        style={{ width: 5, height: 5, background: statusColor }}
                      />
                      <span className="font-mono" style={{ fontSize: 9, color: statusColor, letterSpacing: '0.06em' }}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {agent.label}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {agent.purpose.slice(0, 90)}…
                  </div>
                  <div className="label-mono mt-3" style={{ fontSize: 8, color: agent.color + 'cc' }}>
                    {agent.phase}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected agent detail */}
        {selected && (
          <div
            className="rounded-lg overflow-hidden animate-fade-in"
            style={{ background: 'var(--bg-secondary)', border: `1px solid ${selected.color}30`, borderTop: `2px solid ${selected.color}` }}
          >
            <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: selected.color + '10', color: selected.color }}
              >
                {selected.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.label}</div>
                <div className="label-mono" style={{ fontSize: 8 }}>{selected.phase}</div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="ml-auto text-xs px-2 py-1 rounded hover:bg-white/5"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-3 gap-0">
              {/* Purpose */}
              <div className="p-5" style={{ borderRight: '1px solid var(--border)' }}>
                <div className="label-mono mb-3" style={{ fontSize: 9 }}>PURPOSE</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {selected.purpose}
                </p>
              </div>
              {/* Responsibilities */}
              <div className="p-5" style={{ borderRight: '1px solid var(--border)' }}>
                <div className="label-mono mb-3" style={{ fontSize: 9 }}>RESPONSIBILITIES</div>
                <ul className="space-y-2">
                  {selected.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: selected.color, flexShrink: 0, marginTop: 2 }}>·</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Output */}
              <div className="p-5">
                <div className="label-mono mb-3" style={{ fontSize: 9 }}>OUTPUT</div>
                <ul className="space-y-2">
                  {selected.output.map((o, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <CheckCircle size={10} style={{ color: selected.color, flexShrink: 0, marginTop: 3 }} />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bottom row: Orchestration + Activity */}
        <div className="grid grid-cols-2 gap-4">

          {/* Orchestration flow */}
          <Card>
            <CardHeader
              title="Orchestration Workflow"
              icon={<Cpu size={13} />}
              subtitle="Agent execution order"
            />
            <CardBody>
              <div className="space-y-2">
                {[
                  { label: 'Issue / Bug Report',      color: '#3b82f6',  note: 'Input' },
                  { label: 'Investigator Agent',       color: '#00d4ff',  note: 'Root cause analysis' },
                  { label: 'Root Cause + Evidence',    color: '#00d4ff',  note: 'Handoff' },
                  { label: 'Fix Agent',                color: '#f97316',  note: 'Patch generation' },
                  { label: 'Human Approval',           color: '#eab308',  note: 'Required gate' },
                  { label: 'Test Agent',               color: '#8b5cf6',  note: 'Regression suite' },
                  { label: 'Verification Agent',       color: '#22c55e',  note: 'Final verdict' },
                  { label: 'PR Summary Agent',         color: '#3b82f6',  note: 'Output' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: step.color }}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{step.label}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{step.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent agent activity */}
          <Card>
            <CardHeader
              title="Agent Activity"
              icon={<Activity size={13} />}
              subtitle="Recent agent executions"
              actions={
                <Button variant="ghost" size="sm" onClick={() => router.push('/activity')}>
                  View all
                  <ChevronRight size={11} />
                </Button>
              }
            />
            {activity.length === 0 ? (
              <div className="p-5 text-center">
                <Play size={20} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  No agent activity yet. Run the demo to see agents in action.
                </p>
              </div>
            ) : (
              <div className="py-1">
                {activity.slice(0, 8).map((ev) => {
                  const agentId = eventToAgent(ev.type);
                  const agentDef = AGENTS.find(a => a.id === agentId);
                  const color = agentDef?.color ?? 'var(--text-muted)';
                  return (
                    <div key={ev.id} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: color + '15', color }}
                      >
                        {agentDef?.icon ? (
                          <span style={{ transform: 'scale(0.55)', display: 'block' }}>{agentDef.icon}</span>
                        ) : (
                          <Activity size={9} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }} className="leading-tight">
                          {ev.description}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                          {formatRelative(ev.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
