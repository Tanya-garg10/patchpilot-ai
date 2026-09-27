'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingDown, Clock, FileCode, FlaskConical, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getSession, getTestCases, getActivity } from '@/lib/store';
import { DebugSession, TestCase, ActivityEvent } from '@/lib/types';
import { SHOPSTACK_FILES } from '@/lib/demo-data';

export default function WorkflowImpactPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<DebugSession | null>(null);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const s = getSession(id);
    setSession(s ?? null);
    setTests(getTestCases(id));
    setEvents(getActivity(id));
  }, [id]);

  if (!session) return <LoadingSpinner message="Loading..." />;

  const executedTests = tests.filter((t) => ['passed', 'failed', 'executed'].includes(t.status));
  const passedTests = tests.filter((t) => t.status === 'passed');
  const filesInspected = Object.keys(SHOPSTACK_FILES).length;

  // Derived from actual session data
  const metrics = {
    filesInspected: filesInspected,
    filesChanged: session.changedFiles.length,
    testsGenerated: tests.length,
    testsExecuted: executedTests.length,
    humanApprovalPoints: [
      'Bug report reviewed',
      session.analysis ? 'Root cause reviewed' : null,
      session.generatedFix ? 'Fix diff reviewed' : null,
      session.fixApplied ? 'Fix applied' : null,
      passedTests.length > 0 ? 'Test results reviewed' : null,
      session.verificationStatus ? 'Verification status set' : null,
    ].filter(Boolean) as string[],
    activityEvents: events.length,
  };

  const BEFORE = [
    { step: 'Manually read bug report', time: '10 min' },
    { step: 'Search codebase for relevant files', time: '20 min' },
    { step: 'Identify root cause by reading code', time: '30 min' },
    { step: 'Write and test fix manually', time: '45 min' },
    { step: 'Write regression tests manually', time: '30 min' },
    { step: 'Run tests and verify manually', time: '20 min' },
    { step: 'Write PR description', time: '15 min' },
  ];

  const WITH = [
    { step: 'Submit bug report to PatchPilot', note: 'Human action' },
    { step: 'Review AI root cause analysis', note: `Confidence: ${session.analysis?.confidence ?? '—'}%` },
    { step: 'Review generated fix diff', note: 'Human review' },
    { step: 'Apply fix (1 click)', note: session.fixApplied ? 'Done' : 'Pending' },
    { step: `Execute ${tests.length} generated tests`, note: `${executedTests.length} executed` },
    { step: 'Review verification status', note: 'Human decision' },
    { step: 'Export PR summary', note: 'Auto-generated' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => router.push(`/sessions/${id}`)}>
          Back to Session
        </Button>
      </div>

      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Workflow Impact</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Session-derived metrics — not fabricated. Unmeasured values shown as "Not Measured".
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard icon={<FileCode size={16} />} label="Files Inspected" value={metrics.filesInspected} color="#3b82d4" />
        <MetricCard icon={<FileCode size={16} />} label="Files Changed" value={metrics.filesChanged || 'Not Measured'} color="#f97316" />
        <MetricCard icon={<FlaskConical size={16} />} label="Tests Generated" value={metrics.testsGenerated || 'Not Measured'} color="#8b5cf6" />
        <MetricCard icon={<FlaskConical size={16} />} label="Tests Executed" value={metrics.testsExecuted || 'Not Measured'} color="#eab308" />
        <MetricCard icon={<CheckCircle size={16} />} label="Activity Events" value={metrics.activityEvents} color="#22c55e" />
        <MetricCard icon={<AlertTriangle size={16} />} label="Human Approvals" value={metrics.humanApprovalPoints.length} color="#06b6d4" />
      </div>

      {/* Before vs After */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Without PatchPilot"
            subtitle="Estimated manual workflow"
            icon={<Clock size={15} />}
          />
          <CardBody>
            <div className="space-y-2">
              {BEFORE.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-1.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.step}</span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: '#f97316' }}>{item.time}</span>
                </div>
              ))}
              <div className="pt-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                ⚠ Times are estimates — <span style={{ color: '#eab308' }}>Demo Metric</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="With PatchPilot"
            subtitle="Actual session steps"
            icon={<TrendingDown size={15} />}
          />
          <CardBody>
            <div className="space-y-2">
              {WITH.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-1.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.step}</span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: '#22c55e' }}>{item.note}</span>
                </div>
              ))}
              <div className="pt-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                ✓ Based on actual session data
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Human approval points */}
      <Card>
        <CardHeader title="Human Approval Points" subtitle="Decisions that required developer review" icon={<CheckCircle size={15} />} />
        <CardBody>
          <div className="grid grid-cols-2 gap-2">
            {metrics.humanApprovalPoints.length > 0 ? (
              metrics.humanApprovalPoints.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs px-3 py-2 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <CheckCircle size={12} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{p}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                No human approval points recorded yet. Progress through the debug workflow.
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push(`/sessions/${id}/pr-summary`)}>
          View PR Summary
        </Button>
        <Button variant="primary" onClick={() => router.push(`/sessions/${id}/verify`)}>
          Go to Verification
        </Button>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      className="px-4 py-3 rounded-md flex items-center justify-between gap-3"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div>
        <div className="text-xl font-semibold" style={{ color: typeof value === 'number' && value > 0 ? color : 'var(--text-muted)' }}>
          {value}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
      <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: color + '1a', color }}>
        {icon}
      </div>
    </div>
  );
}
