'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getSession, getTestCases, addActivity } from '@/lib/store';
import { verificationStatusLabel, formatDateTime } from '@/lib/utils';
import { DebugSession, TestCase } from '@/lib/types';

export default function PRSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<DebugSession | null>(null);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [copied, setCopied] = useState(false);

  const reload = useCallback(() => {
    const s = getSession(id);
    setSession(s ?? null);
    setTests(getTestCases(id));
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  if (!session) return <LoadingSpinner message="Loading PR summary..." />;

  const passedTests = tests.filter((t) => t.status === 'passed');
  const executedTests = tests.filter((t) => ['passed', 'failed', 'executed'].includes(t.status));

  const summary = `## ${session.title}

**Root Cause:** ${session.analysis?.rootCause ?? 'Analysis not performed'}

**Changes Made:** ${session.generatedFix?.explanation ?? 'No fix applied'}

**Files Changed:**
${session.changedFiles.map((f) => `- \`${f}\``).join('\n') || '- None'}

**Tests Added:** ${tests.length}
**Tests Passed:** ${passedTests.length} / ${executedTests.length} executed

**Verification:** ${verificationStatusLabel(session.verificationStatus)}

**Risks:**
${session.analysis?.risks.map((r) => `- ${r}`).join('\n') ?? '- None identified'}

**Next Steps:**
${passedTests.length === tests.length && tests.length > 0
    ? '- Ready to merge\n- Monitor production metrics'
    : '- Execute remaining tests before merging'}
`;

  async function handleCopy() {
    await navigator.clipboard.writeText(summary);
    addActivity({
      sessionId: id,
      projectId: session!.projectId,
      type: 'pr_summary_created',
      description: 'PR summary exported',
      metadata: {},
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => router.push(`/sessions/${id}/verify`)}>
          Back to Verify
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>PR Summary</h1>
          <p className="text-sm mt-0.5 truncate max-w-md" style={{ color: 'var(--text-muted)' }}>{session.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Copy size={13} />} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/sessions/new')}>
            New Session
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Pull Request Summary" subtitle="Generated from session data" />
        <CardBody>
          <div className="space-y-6">
            <PRSection title="Title">{session.title}</PRSection>
            <PRSection title="Summary">{session.bugReport}</PRSection>
            <PRSection title="Root Cause">{session.analysis?.rootCause ?? 'Not analyzed'}</PRSection>
            <PRSection title="Changes Made">{session.generatedFix?.explanation ?? 'No fix applied'}</PRSection>
            <PRSection title="Files Changed">
              {session.changedFiles.length > 0 ? (
                session.changedFiles.map((f) => (
                  <div key={f} className="text-xs mono px-2 py-1 rounded mt-1" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{f}</div>
                ))
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>None</span>
              )}
            </PRSection>
            <PRSection title="Tests Added">
              {tests.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {tests.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                      <span style={{ color: t.status === 'passed' ? '#22c55e' : t.status === 'failed' ? '#ef4444' : 'var(--text-muted)' }}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>None generated</span>
              )}
            </PRSection>
            <PRSection title="Verification Status">
              <span className="font-medium">{verificationStatusLabel(session.verificationStatus)}</span>
            </PRSection>
            <PRSection title="Risks">
              {session.analysis?.risks.length ? (
                <ul className="space-y-1 mt-1">
                  {session.analysis.risks.map((r, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>{r}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>None identified</span>
              )}
            </PRSection>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push('/sessions')}>
          Back to Sessions
        </Button>
        <Button variant="primary" onClick={() => router.push('/sessions/new')}>
          Start New Debug Session
        </Button>
      </div>
    </div>
  );
}

function PRSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{children}</div>
    </div>
  );
}
