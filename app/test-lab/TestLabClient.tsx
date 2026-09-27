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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getTestCases, getSession, getSessions, saveTestCase, addActivity } from '@/lib/store';
import { formatRelative, testStatusLabel, testStatusColor } from '@/lib/utils';
import { TestCase, DebugSession } from '@/lib/types';

export default function TestLabClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session') ?? '';
  const [tests, setTests] = useState<TestCase[]>([]);
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [activeSession, setActiveSession] = useState<string>(sessionId);
  const [previewTest, setPreviewTest] = useState<TestCase | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

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
        ? 'Test executed — assertion passed ✓'
        : 'Not Executed — Fix not yet applied. Needs Verification.';
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
        description: `Test executed: "${tc.name}" — ${fixApplied ? 'Passed' : 'Needs Verification'}`,
        metadata: { passed: fixApplied, testId: tc.id },
      });
      reload();
    } finally {
      setExecuting(null);
    }
  }

  async function handleExecuteAll() {
    const pending = tests.filter((t) => !['passed', 'failed'].includes(t.status));
    for (const tc of pending) {
      await handleExecuteTest(tc);
    }
  }

  function handleMarkReady(tc: TestCase) {
    saveTestCase({ ...tc, status: 'ready' });
    reload();
  }

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status === 'failed').length;
  const session = activeSession ? getSession(activeSession) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Test Lab</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Generate and execute regression tests for debug sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tests.length > 0 && (
            <Button variant="secondary" size="sm" icon={<Play size={13} />} onClick={handleExecuteAll}>
              Execute All
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Session:</span>
        <select
          value={activeSession}
          onChange={(e) => setActiveSession(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-md"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        >
          <option value="">All sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        {activeSession && session && (
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={13} />}
            onClick={() => router.push(`/sessions/${activeSession}`)}
          >
            Open Session
          </Button>
        )}
      </div>

      {tests.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: tests.length, color: 'var(--text-secondary)' },
            { label: 'Passed', value: passedCount, color: '#22c55e' },
            { label: 'Failed', value: failedCount, color: '#ef4444' },
            { label: 'Pending', value: tests.length - passedCount - failedCount, color: '#eab308' },
          ].map((s) => (
            <div
              key={s.label}
              className="px-4 py-3 rounded-md text-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <CardHeader
              title="Test Cases"
              subtitle={tests.length > 0 ? `${tests.length} test(s)` : 'No tests'}
              icon={<FlaskConical size={15} />}
            />
            {tests.length === 0 ? (
              <EmptyState
                icon={<FlaskConical size={28} />}
                title="No test cases"
                description="Select a session that has had tests generated, or run the ShopStack demo."
              />
            ) : (
              tests.map((tc) => (
                <div
                  key={tc.id}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tc.name}</span>
                      <span className={`text-xs ${testStatusColor(tc.status)}`}>{testStatusLabel(tc.status)}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tc.description}</div>
                    {tc.result && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: tc.status === 'passed' ? '#22c55e' : tc.status === 'failed' ? '#ef4444' : 'var(--text-muted)' }}
                      >
                        {tc.result}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setPreviewTest(tc === previewTest ? null : tc)}
                      style={{ color: 'var(--text-muted)' }}
                      title="Preview code"
                    >
                      <Eye size={13} />
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
                        icon={<Play size={12} />}
                        loading={executing === tc.id}
                        onClick={() => handleExecuteTest(tc)}
                      >
                        Execute
                      </Button>
                    )}
                    {tc.status === 'passed' && <CheckCircle size={16} style={{ color: '#22c55e' }} />}
                    {tc.status === 'failed' && <XCircle size={16} style={{ color: '#ef4444' }} />}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        <div>
          {previewTest ? (
            <Card>
              <CardHeader title="Test Preview" subtitle={previewTest.name} />
              <CardBody>
                <pre
                  className="text-xs leading-relaxed whitespace-pre-wrap overflow-auto rounded p-3"
                  style={{ background: '#0e1117', color: '#a5f3fc', fontFamily: 'ui-monospace, monospace', maxHeight: 400 }}
                >
                  {previewTest.code}
                </pre>
                <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Status: <span className={testStatusColor(previewTest.status)}>{testStatusLabel(previewTest.status)}</span>
                </div>
                {previewTest.executedAt && (
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Executed: {formatRelative(previewTest.executedAt)}
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader title="About Test Lab" icon={<Zap size={15} />} />
              <CardBody>
                <div className="space-y-3">
                  {[
                    { label: 'Suggested', desc: 'AI-generated test scenario, not yet reviewed' },
                    { label: 'Ready', desc: 'Reviewed and approved for execution' },
                    { label: 'Executed', desc: 'Test ran — awaiting result review' },
                    { label: 'Passed', desc: 'Test executed and assertion passed ✓' },
                    { label: 'Failed', desc: 'Test executed and assertion failed ✗' },
                    { label: 'Needs Verification', desc: 'Cannot auto-execute — manual review required' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
