'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bug,
  CheckCircle,
  FlaskConical,
  Zap,
  Play,
  Plus,
  Clock,
  TrendingUp,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSessions, getActivity, getTestCases } from '@/lib/store';
import { formatRelative, sessionStatusLabel, sessionStatusColor } from '@/lib/utils';
import { DebugSession, ActivityEvent } from '@/lib/types';
import { runDemo } from '@/lib/run-demo';

const WORKFLOW_STAGES = [
  { id: 1, label: 'Report', color: '#3b82d4' },
  { id: 2, label: 'Reproduce', color: '#8b5cf6' },
  { id: 3, label: 'Analyze', color: '#06b6d4' },
  { id: 4, label: 'Fix', color: '#f97316' },
  { id: 5, label: 'Test', color: '#eab308' },
  { id: 6, label: 'Verify', color: '#22c55e' },
];

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  bug_report_created: <Bug size={12} />,
  analysis_started: <Zap size={12} />,
  root_cause_identified: <Zap size={12} />,
  fix_generated: <FileCode size={12} />,
  fix_applied: <CheckCircle size={12} />,
  tests_generated: <FlaskConical size={12} />,
  tests_executed: <FlaskConical size={12} />,
  verification_completed: <CheckCircle size={12} />,
  pr_summary_created: <FileCode size={12} />,
  session_created: <Plus size={12} />,
};

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [testCount, setTestCount] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    setSessions(getSessions());
    setActivity(getActivity().slice(0, 8));
    setTestCount(getTestCases().length);
  }, []);

  const activeCount = sessions.filter((s) => !['verified', 'closed'].includes(s.status)).length;
  const resolvedCount = sessions.filter((s) => s.status === 'verified').length;
  const recentSessions = sessions.slice(-5).reverse();

  async function handleRunDemo() {
    setDemoRunning(true);
    try {
      const sessionId = await runDemo();
      setSessions(getSessions());
      setActivity(getActivity().slice(0, 8));
      setTestCount(getTestCases().length);
      router.push(`/sessions/${sessionId}`);
    } finally {
      setDemoRunning(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Fix bugs with a clearer path
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            From bug report to verified solution — without the context switching.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<Play size={14} />}
            loading={demoRunning}
            onClick={handleRunDemo}
          >
            Run Demo
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => router.push('/sessions/new')}
          >
            Start Debug Session
          </Button>
        </div>
      </div>

      {/* Workflow pipeline */}
      <Card>
        <CardBody className="py-5">
          <div className="flex items-center gap-0">
            {WORKFLOW_STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-center flex-1 min-w-0">
                <div
                  className="flex-1 flex flex-col items-center gap-1.5 py-2 px-3 rounded-md cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: stage.color + '22', color: stage.color, border: `1.5px solid ${stage.color}66` }}
                  >
                    {stage.id}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {stage.label}
                  </span>
                </div>
                {i < WORKFLOW_STAGES.length - 1 && (
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Active Sessions',
            value: activeCount,
            icon: <Bug size={16} />,
            color: '#3b82d4',
            note: 'From session data',
          },
          {
            label: 'Issues Resolved',
            value: resolvedCount,
            icon: <CheckCircle size={16} />,
            color: '#22c55e',
            note: 'Verified sessions',
          },
          {
            label: 'Tests Generated',
            value: testCount,
            icon: <FlaskConical size={16} />,
            color: '#8b5cf6',
            note: 'From session data',
          },
          {
            label: 'Manual Steps Reduced',
            value: sessions.length > 0 ? `~${sessions.length * 6}` : '—',
            icon: <TrendingUp size={16} />,
            color: '#06b6d4',
            note: sessions.length > 0 ? 'Demo metric' : 'Run a session first',
          },
        ].map((m) => (
          <Card key={m.label}>
            <CardBody>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {m.value}
                  </div>
                  <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {m.label}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {m.note}
                  </div>
                </div>
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: m.color + '1a', color: m.color }}
                >
                  {m.icon}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Recent Sessions */}
        <div className="col-span-2">
          <Card>
            <CardHeader
              title="Recent Sessions"
              subtitle="Latest debug sessions"
              icon={<Bug size={15} />}
              actions={
                <Button variant="ghost" size="sm" onClick={() => router.push('/sessions')}>
                  View all
                </Button>
              }
            />
            <div>
              {recentSessions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No sessions yet. Run the demo or start a debug session.
                  </p>
                </div>
              ) : (
                recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onClick={() => router.push(`/sessions/${s.id}`)}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {s.title}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {formatRelative(s.createdAt)}
                      </div>
                    </div>
                    <span className={`text-xs font-medium flex-shrink-0 ${sessionStatusColor(s.status)}`}>
                      {sessionStatusLabel(s.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions + Activity */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Quick Actions" icon={<Zap size={15} />} />
            <CardBody className="flex flex-col gap-2">
              <Button
                variant="primary"
                className="w-full justify-start"
                icon={<Plus size={14} />}
                onClick={() => router.push('/sessions/new')}
              >
                New Debug Session
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                icon={<Play size={14} />}
                loading={demoRunning}
                onClick={handleRunDemo}
              >
                Run ShopStack Demo
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                icon={<FolderIcon />}
                onClick={() => router.push('/projects')}
              >
                View Projects
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                icon={<FlaskConical size={14} />}
                onClick={() => router.push('/test-lab')}
              >
                Open Test Lab
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" icon={<Clock size={15} />} />
            <div>
              {activity.length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No activity yet
                </div>
              ) : (
                activity.slice(0, 6).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 px-4 py-2.5"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <div className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {ACTIVITY_ICONS[ev.type] ?? <Clock size={12} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {ev.description}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {formatRelative(ev.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
