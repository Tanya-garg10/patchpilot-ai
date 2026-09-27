'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileCode,
  FlaskConical,
  Shield,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getSession, getTestCases, setVerification, addActivity } from '@/lib/store';
import { formatDateTime, verificationStatusLabel, verificationStatusColor } from '@/lib/utils';
import { DebugSession, TestCase, VerificationStatus } from '@/lib/types';

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<DebugSession | null>(null);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [prCopied, setPrCopied] = useState(false);

  const reload = useCallback(() => {
    const s = getSession(id);
    setSession(s ?? null);
    setTests(getTestCases(id));
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  if (!session) return <LoadingSpinner message="Loading verification..." />;

  const passedTests = tests.filter((t) => t.status === 'passed');
  const failedTests = tests.filter((t) => t.status === 'failed');
  const executedTests = tests.filter((t) => ['passed', 'failed', 'executed'].includes(t.status));

  function deriveVerificationStatus(): VerificationStatus {
    if (!session!.fixApplied) return 'needs_verification';
    if (failedTests.length > 0) return 'failed';
    if (passedTests.length > 0 && passedTests.length === executedTests.length) return 'verified';
    if (passedTests.length > 0) return 'partially_verified';
    if (session!.fixApplied && tests.length > 0) return 'partially_verified';
    return 'needs_verification';
  }

  function handleSetVerification(status: VerificationStatus) {
    setVerification(id, status);
    reload();
  }

  function generatePRSummary(): string {
    if (!session) return '';
    const status = deriveVerificationStatus();
    return `## ${session.title}

### Summary
${session.bugReport}

### Root Cause
${session.analysis?.rootCause ?? 'Analysis not performed'}

### Changes Made
${session.generatedFix?.explanation ?? 'No fix applied'}

### Files Changed
${(session.changedFiles ?? []).map((f) => `- \`${f}\``).join('\n') || '- None'}

### Tests Added
${tests.map((t) => `- ${t.name}: **${t.status}**`).join('\n') || '- None'}

### Testing Status
- Tests Generated: ${tests.length}
- Tests Executed: ${executedTests.length}
- Tests Passed: ${passedTests.length}
- Tests Failed: ${failedTests.length}

### Verification Status
${verificationStatusLabel(status)}

### Risks
${session.analysis?.risks.map((r) => `- ${r}`).join('\n') ?? '- None identified'}

### Next Steps
${passedTests.length === tests.length && tests.length > 0
  ? '- Ready to merge\n- Monitor production for regression'
  : '- Execute remaining tests\n- Review test results before merging'}
`;
  }

  async function handleCopyPR() {
    const summary = generatePRSummary();
    await navigator.clipboard.writeText(summary);
    addActivity({
      sessionId: id,
      projectId: session!.projectId,
      type: 'pr_summary_created',
      description: 'PR summary copied to clipboard',
      metadata: {},
    });
    setPrCopied(true);
    setTimeout(() => setPrCopied(false), 2000);
  }

  const vStatus = session.verificationStatus ?? deriveVerificationStatus();

  const timelineItems = [
    { label: 'Bug Report Created', done: true, time: session.createdAt },
    { label: 'Analysis Completed', done: !!session.analysis, time: session.updatedAt },
    { label: 'Fix Generated', done: !!session.generatedFix },
    { label: 'Fix Applied', done: session.fixApplied, time: session.appliedAt ?? undefined },
    { label: 'Tests Generated', done: tests.length > 0 },
    { label: 'Tests Executed', done: executedTests.length > 0 },
    { label: 'Verification', done: !!session.verificationStatus },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => router.push(`/sessions/${id}`)}>
          Back to Session
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Verification</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{session.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${verificationStatusColor(vStatus)}`}>
            {verificationStatusLabel(vStatus)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* Original Bug */}
          <Card>
            <CardHeader title="Original Bug" icon={<AlertTriangle size={15} />} />
            <CardBody>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>BEFORE</div>
                  <p className="text-xs leading-relaxed" style={{ color: '#fca5a5' }}>
                    {session.actualBehavior || session.bugReport}
                  </p>
                </div>
                {session.fixApplied && (
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>AFTER</div>
                    <p className="text-xs leading-relaxed" style={{ color: '#86efac' }}>
                      {session.expectedBehavior || 'Fix applied — expected behavior should now be in effect.'}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Fix Applied */}
          <Card>
            <CardHeader title="Fix Applied" icon={<FileCode size={15} />} />
            <CardBody>
              {session.fixApplied ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#22c55e' }}>
                    <CheckCircle size={13} />
                    <span>Fix applied {session.appliedAt ? formatDateTime(session.appliedAt) : ''}</span>
                  </div>
                  {session.changedFiles.map((f) => (
                    <div key={f} className="text-xs mono px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      {f}
                    </div>
                  ))}
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {session.generatedFix?.explanation}
                  </p>
                </div>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fix not yet applied.</p>
              )}
            </CardBody>
          </Card>

          {/* Remaining Risks */}
          <Card>
            <CardHeader title="Remaining Risks" icon={<Shield size={15} />} />
            <CardBody>
              {session.analysis?.risks.length ? (
                <ul className="space-y-1.5">
                  {session.analysis.risks.map((r, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>{r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No risks identified.</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Tests */}
          <Card>
            <CardHeader title="Test Results" icon={<FlaskConical size={15} />} />
            <CardBody>
              {tests.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tests generated yet.</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <Stat label="Generated" value={tests.length} color="var(--text-secondary)" />
                    <Stat label="Passed" value={passedTests.length} color="#22c55e" />
                    <Stat label="Failed" value={failedTests.length} color="#ef4444" />
                  </div>
                  {tests.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-2 py-1.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                        {t.result && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.result}</div>}
                      </div>
                      <TestStatusIcon status={t.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Timeline" icon={<Clock size={15} />} />
            <CardBody>
              <div className="space-y-0">
                {timelineItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: item.done ? 'rgba(34,197,94,0.15)' : 'var(--bg-elevated)',
                          border: `1.5px solid ${item.done ? '#22c55e' : 'var(--border)'}`,
                        }}
                      >
                        {item.done
                          ? <CheckCircle size={10} style={{ color: '#22c55e' }} />
                          : <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
                        }
                      </div>
                      {i < timelineItems.length - 1 && (
                        <div className="w-px flex-1 my-0.5" style={{ background: item.done ? '#22c55e40' : 'var(--border)', minHeight: 16 }} />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="text-xs font-medium" style={{ color: item.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {item.label}
                      </div>
                      {item.time && (
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(item.time)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Set verification */}
          <Card>
            <CardHeader title="Set Verification Status" />
            <CardBody className="space-y-2">
              {(['verified', 'partially_verified', 'needs_verification', 'failed'] as VerificationStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSetVerification(s)}
                  className="w-full text-left text-xs px-3 py-2 rounded-md flex items-center justify-between transition-colors hover:bg-white/5"
                  style={{
                    border: `1px solid ${session.verificationStatus === s ? 'var(--accent)' : 'var(--border)'}`,
                    background: session.verificationStatus === s ? 'var(--accent-glow)' : 'transparent',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className={verificationStatusColor(s)}>{verificationStatusLabel(s)}</span>
                  {session.verificationStatus === s && <CheckCircle size={12} style={{ color: 'var(--accent)' }} />}
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* PR Summary */}
      <Card>
        <CardHeader
          title="PR Summary"
          icon={<FileCode size={15} />}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={<Copy size={13} />} onClick={handleCopyPR}>
                {prCopied ? 'Copied!' : 'Copy Summary'}
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push(`/sessions/${id}/pr-summary`)}>
                View Full PR
              </Button>
            </div>
          }
        />
        <CardBody>
          <pre
            className="text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--text-secondary)', fontFamily: 'inherit' }}
          >
            {generatePRSummary()}
          </pre>
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-semibold" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function TestStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'passed': return <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0 }} />;
    case 'failed': return <XCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />;
    case 'needs_verification': return <AlertTriangle size={13} style={{ color: '#eab308', flexShrink: 0 }} />;
    default: return <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />;
  }
}
