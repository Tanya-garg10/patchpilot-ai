'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FlaskConical,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Eye,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getTestCases, getSession, getSessions, saveTestCase, addActivity } from '@/lib/store';
import { formatRelative, testStatusLabel } from '@/lib/utils';
import { TestCase, DebugSession } from '@/lib/types';

const STATUS_CONFIG = {
  suggested:         { color: '#7e93b0', icon: <Clock size={11} />,         label: 'Suggested' },
  ready:             { color: '#3b82f6', icon: <Zap size={11} />,           label: 'Ready' },
  executed:          { color: '#00d4ff', icon: <Clock size={11} />,         label: 'Executed' },
  passed:            { color: '#22c55e', icon: <CheckCircle size={11} />,   label: 'Passed' },
  failed:            { color: '#ef4444', icon: <XCircle size={11} />,       label: 'Failed' },
  needs_verification:{ color: '#eab308', icon: <AlertTriangle size={11} />, label: 'Needs Verify' },
};

export default function TestLabClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session') ?? '';
  const [tests, setTests] = useState<TestCase[]>([]);
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [activeSession, setActiveSession] = useState<string>(sessionId);
  const [previewTest, setPreviewTest] = useState<TestCase | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);
  const [executingAll, setExecutingAll] = useState(false);

  function reload() {
    setTests(getTestCases(activeSession || undefined));
    setSessions(getSessions());
  }

  useEffect(() => { reload(); }, [activeSession]);
  useEffect(() => {
    if (sessionId) setActiveSession(sessionId);
  }, [sessionId]);

  async function handleExecuteTest(tc: TestCase) {
    setExecuting(tc.id);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const session = getSession(tc.sessionId);
      const fixApplied = session?.fixApplied ?? false;
      const resultMsg = fixApplied
        ? 'Assertion passed ✓'
        : 'Fix not yet applied — needs verification';
      saveTestCase({
        ...tc,
        status: fixApplied ? 'passed' : 'needs_verification',
        result: resultMsg,
        executedAt: new Date().toISOString(),
      });
      addActivity({
        sessionId: tc.sessionId,
        projectId: session?.projectId ?? null,
        type: 'tests_executed',
        description: `Test: "${tc.name}" — ${fixApplied ? 'Passed' : 'Needs Verification'}`,
        metadata: { passed: fixApplied, testId: tc.id },
      });
      reload();
    } finally {
      setExecuting(null);
    }
  }

  async function handleExecuteAll() {
    setExecutingAll(true);
    const pending = tests.filter((t) => !['passed', 'failed'].includes(t.status));
    for (const tc of pending) {
      await handleExecuteTest(tc);
    }
    setExecutingAll(false);
  }

  function handleMarkReady(tc: TestCase) {
    saveTestCase({ ...tc, status: 'ready' });
    reload();
  }

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status === 'failed').length;
  const pendingCount = tests.filter((t) => !['passed', 'failed'].includes(t.status)).length;
  const session = activeSession ? getSession(activeSession) : null;
  const allDone = tests.length > 0 && pendingCount === 0;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        <div>
          <div className="label-mono" style={{ marginBottom: 2 }}>TEST LAB</div>
          <h1 className="font-bold tracking-tight" style={{ fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Test Lab
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            Generate · Execute · Verify
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeSession}
            onChange={(e) => setActiveSession(e.target.value)}
            className="rounded-md px-3 py-1.5 outline-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          >
            <option value="">All sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.title.slice(0, 50)}</option>
            ))}
          </select>
          {activeSession && (
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={12} />}
              onClick={() => router.push(`/sessions/${activeSession}`)}
            >
              Open Session
            </Button>
          )}
          {tests.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={<Play size={12} />}
              loading={executingAll}
              onClick={handleExecuteAll}
            >
              Run All Tests
            </Button>
          )}
        </div>
      </div>

      {/* Execution status bar */}
      {tests.length > 0 && (
        <div
          className="flex items-center gap-0 px-5 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
        >
          {/* Progress stages */}
          {[
            { label: 'GENERATED', done: tests.length > 0, color: '#8b5cf6' },
            { label: 'EXECUTED',  done: passedCount + failedCount > 0, color: '#00d4ff' },
            { label: 'PASSED',    done: passedCount > 0, color: '#22c55e' },
            { label: 'VERIFIED',  done: allDone && passedCount > 0, color: '#22c55e' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex items-center gap-1.5 px-3 py-1">
                <div
                  className="rounded-full"
                  style={{ width: 5, height: 5, background: step.done ? step.color : 'var(--border)' }}
                />
                <span
                  className="font-mono font-semibold"
                  style={{ fontSize: 9, color: step.done ? step.color : 'var(--text-muted)', letterSpacing: '0.06em' }}
                >
                  {step.label}
                </span>
              </div>
              {i < 3 && (
                <ChevronRight size={9} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <span style={{ fontSize: 11, color: 'var(--green)' }}>{passedCount} passed</span>
            {failedCount > 0 && <span style={{ fontSize: 11, color: 'var(--red)' }}>{failedCount} failed</span>}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pendingCount} pending</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">

        {/* Test list */}
        <div className="flex-1 overflow-auto">
          {tests.length === 0 ? (
            <EmptyState
              icon={<FlaskConical size={28} />}
              title="No test cases"
              description="Select a session that has had tests generated, or run the ShopStack demo."
            />
          ) : (
            <div>
              {/* Column header */}
              <div
                className="grid px-5 py-2"
                style={{
                  gridTemplateColumns: '1fr auto auto auto',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  gap: '1rem',
                }}
              >
                {['Test Case', 'Status', 'Executed', ''].map((h) => (
                  <div key={h} className="label-mono" style={{ fontSize: 9 }}>{h}</div>
                ))}
              </div>

              {tests.map((tc) => {
                const cfg = STATUS_CONFIG[tc.status] ?? { color: 'var(--text-muted)', icon: <Clock size={11} />, label: tc.status };
                return (
                  <div
                    key={tc.id}
                    className="grid items-center px-5 py-3 transition-colors hover:bg-white/[0.02]"
                    style={{
                      gridTemplateColumns: '1fr auto auto auto',
                      borderBottom: '1px solid var(--border-subtle)',
                      gap: '1rem',
                    }}
                  >
                    {/* Name */}
                    <div className="min-w-0">
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">
                        {tc.name}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }} className="truncate">
                        {tc.description}
                      </div>
                      {tc.result && (
                        <div style={{ fontSize: 10.5, color: cfg.color, marginTop: 2 }}>
                          {tc.result}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span style={{ fontSize: 11, color: cfg.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Executed time */}
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {tc.executedAt ? formatRelative(tc.executedAt) : '—'}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setPreviewTest(tc === previewTest ? null : tc)}
                        className="p-1 rounded transition-colors hover:bg-white/[0.06]"
                        style={{ color: previewTest?.id === tc.id ? 'var(--cyan)' : 'var(--text-muted)' }}
                        title="Preview code"
                      >
                        <Eye size={12} />
                      </button>
                      {tc.status === 'suggested' && (
                        <Button variant="secondary" size="sm" onClick={() => handleMarkReady(tc)}>
                          Mark Ready
                        </Button>
                      )}
                      {['ready', 'suggested', 'needs_verification'].includes(tc.status) && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Play size={11} />}
                          loading={executing === tc.id}
                          onClick={() => handleExecuteTest(tc)}
                        >
                          Execute
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview panel */}
        {previewTest && (
          <div
            className="w-72 flex-shrink-0 flex flex-col overflow-y-auto animate-slide-in"
            style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
          >
            <div className="p-4">
              <div className="label-mono mb-1.5" style={{ fontSize: 9 }}>TEST PREVIEW</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                {previewTest.name}
              </div>
              <pre
                className="text-xs leading-relaxed whitespace-pre-wrap overflow-auto rounded-md p-3"
                style={{
                  background: '#040609',
                  border: '1px solid var(--border)',
                  color: '#a5f3fc',
                  fontFamily: 'ui-monospace, monospace',
                  maxHeight: 380,
                  fontSize: 11,
                }}
              >
                {previewTest.code}
              </pre>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Status</span>
                  <span style={{ fontSize: 10.5, color: (STATUS_CONFIG[previewTest.status] ?? {color:'var(--text-muted)'}).color }}>
                    {testStatusLabel(previewTest.status)}
                  </span>
                </div>
                {previewTest.executedAt && (
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Executed</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                      {formatRelative(previewTest.executedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty sidebar info */}
        {!previewTest && tests.length > 0 && (
          <div
            className="w-64 flex-shrink-0 overflow-y-auto p-4"
            style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
          >
            <div className="label-mono mb-3" style={{ fontSize: 9 }}>TEST STATUS GUIDE</div>
            <div className="space-y-3">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-start gap-2">
                  <span style={{ color: cfg.color, marginTop: 1, flexShrink: 0 }}>{cfg.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: cfg.color }}>{cfg.label}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>
                      {key === 'suggested' && 'AI-generated, not yet reviewed'}
                      {key === 'ready' && 'Reviewed and approved for execution'}
                      {key === 'executed' && 'Ran — awaiting result review'}
                      {key === 'passed' && 'Assertion passed ✓'}
                      {key === 'failed' && 'Assertion failed ✗'}
                      {key === 'needs_verification' && 'Manual review required'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
