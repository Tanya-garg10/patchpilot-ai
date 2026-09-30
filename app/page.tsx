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
  ChevronRight,
  Target,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { getSessions, getActivity, getTestCases } from '@/lib/store';
import { formatRelative, sessionStatusLabel, sessionStatusColor } from '@/lib/utils';
import { DebugSession, ActivityEvent } from '@/lib/types';
import { runDemo } from '@/lib/run-demo';

const PIPELINE_STAGES = [
  { id: 1, label: 'ISSUE',       color: '#3b82f6',  desc: 'Bug reported' },
  { id: 2, label: 'INVESTIGATE', color: '#8b5cf6',  desc: 'Investigator Agent' },
  { id: 3, label: 'ROOT CAUSE',  color: '#00d4ff',  desc: 'Evidence + confidence' },
  { id: 4, label: 'FIX',         color: '#f97316',  desc: 'Human approval' },
  { id: 5, label: 'TEST',        color: '#eab308',  desc: 'Regression suite' },
  { id: 6, label: 'VERIFIED',    color: '#22c55e',  desc: 'Verification Agent' },
];

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  bug_report_created:     <Bug size={11} />,
  analysis_started:       <Zap size={11} />,
  root_cause_identified:  <Target size={11} />,
  fix_generated:          <FileCode size={11} />,
  fix_applied:            <CheckCircle size={11} />,
  tests_generated:        <FlaskConical size={11} />,
  tests_executed:         <FlaskConical size={11} />,
  verification_completed: <Shield size={11} />,
  pr_summary_created:     <FileCode size={11} />,
  session_created:        <Plus size={11} />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  bug_report_created:     '#3b82f6',
  analysis_started:       '#8b5cf6',
  root_cause_identified:  '#00d4ff',
  fix_generated:          '#f97316',
  fix_applied:            '#22c55e',
  tests_generated:        '#8b5cf6',
  tests_executed:         '#eab308',
  verification_completed: '#22c55e',
  pr_summary_created:     '#3b82f6',
  session_created:        'var(--text-muted)',
};

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions]     = useState<DebugSession[]>([]);
  const [activity, setActivity]     = useState<ActivityEvent[]>([]);
  const [testCount, setTestCount]   = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    setSessions(getSessions());
    setActivity(getActivity().slice(0, 10));
    setTestCount(getTestCases().length);
  }, []);

  const activeCount   = sessions.filter((s) => !['verified', 'closed'].includes(s.status)).length;
  const resolvedCount = sessions.filter((s) => s.status === 'verified').length;
  const recentSessions = sessions.slice(-6).reverse();

  async function handleRunDemo() {
    setDemoRunning(true);
    try {
      const sessionId = await runDemo();
      setSessions(getSessions());
      setActivity(getActivity().slice(0, 10));
      setTestCount(getTestCases().length);
      router.push(`/sessions/${sessionId}`);
    } finally {
      setDemoRunning(false);
    }
  }

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">

      {/* ── Hero / Command Center ──────────────────────────────── */}
      <div
        className="relative rounded-lg overflow-hidden px-6 py-5"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 grid-bg opacity-30 pointer-events-none"
        />
        {/* Cyan glow accent top-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -60, left: -40,
            width: 220, height: 160,
            background: 'radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex items-center justify-between gap-6">
          <div>
            {/* Label */}
            <div
              className="label-mono mb-2"
              style={{ color: 'var(--cyan)', letterSpacing: '0.1em' }}
            >
              ENGINEERING COMMAND CENTER
            </div>
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.03em' }}
            >
              PatchPilot
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Autonomous AI engineering agent — from issue to verified fix.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="secondary"
              icon={<Play size={12} />}
              loading={demoRunning}
              onClick={handleRunDemo}
            >
              Load Demo
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={12} />}
              onClick={() => router.push('/sessions/new')}
            >
              New Debug Session
            </Button>
          </div>
        </div>

        {/* Pipeline */}
        <div className="relative flex items-center gap-0 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="label-mono mr-4" style={{ fontSize: 9, flexShrink: 0 }}>BUG SIGNAL</div>
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id} className="flex items-center flex-1 min-w-0">
              <div className="flex-1 flex flex-col items-center gap-1 group cursor-pointer px-1">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-all duration-150 group-hover:bg-white/[0.04]"
                  style={{ border: `1px solid ${stage.color}22` }}
                >
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{ width: 5, height: 5, background: stage.color }}
                  />
                  <span
                    className="font-mono font-semibold"
                    style={{ fontSize: 9.5, color: stage.color, letterSpacing: '0.06em' }}
                  >
                    {stage.label}
                  </span>
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{stage.desc}</span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{ width: 1, height: 28, background: 'var(--border)', flexShrink: 0 }} />
              )}
            </div>
          ))}
          <div className="label-mono ml-4" style={{ fontSize: 9, color: 'var(--green)', flexShrink: 0 }}>VERIFIED</div>
        </div>
      </div>

      {/* ── Metrics ───────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Issues',       value: activeCount,   icon: <Bug size={14} />,          color: '#3b82f6',  note: 'in progress' },
          { label: 'AI Investigations',   value: resolvedCount + activeCount, icon: <CheckCircle size={14} />, color: '#22c55e',  note: 'completed' },
          { label: 'Fixes Verified',      value: resolvedCount, icon: <FlaskConical size={14} />,  color: '#8b5cf6',  note: 'autonomous fixes' },
          {
            label: 'Regression Tests',
            value: testCount,
            icon: <Shield size={14} />,
            color: '#00d4ff',
            note: sessions.length > 0 ? 'generated' : 'run demo first',
          },
        ].map((m) => (
          <div
            key={m.label}
            className="surface rounded-lg overflow-hidden"
            style={{ borderTop: `1.5px solid ${m.color}` }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className="font-bold tracking-tight"
                    style={{ fontSize: 28, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}
                  >
                    {m.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {m.note}
                  </div>
                </div>
                <div
                  className="rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ width: 32, height: 32, background: m.color + '12', color: m.color }}
                >
                  {m.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sessions + Activity + Quick Actions ─────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent Sessions — spans 2 cols */}
        <div className="col-span-2">
          <Card>
            <CardHeader
              title="Recent Issues"
              subtitle={`${recentSessions.length} issues`}
              icon={<Bug size={13} />}
              actions={
                <Button variant="ghost" size="sm" onClick={() => router.push('/sessions')}>
                  View all
                  <ChevronRight size={11} />
                </Button>
              }
            />
            {recentSessions.length === 0 ? (
              <div className="py-12 text-center">
                <Bug size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  No issues yet — load the demo or create a new issue.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="secondary" size="sm" loading={demoRunning} onClick={handleRunDemo}>
                    Load ShopStack Demo
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => router.push('/sessions/new')}>
                    New Issue
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {recentSessions.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: i < recentSessions.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    onClick={() => router.push(`/sessions/${s.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                      >
                        <Bug size={11} />
                      </div>
                      <div className="min-w-0">
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">
                          {s.title}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>
                          {formatRelative(s.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium ${sessionStatusColor(s.status)}`}>
                        {sessionStatusLabel(s.status)}
                      </span>
                      <ChevronRight size={11} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column — Quick Actions + Activity */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" icon={<Zap size={13} />} />
            <CardBody className="flex flex-col gap-1.5">
              <Button
                variant="primary"
                className="w-full justify-start"
                icon={<Plus size={12} />}
                onClick={() => router.push('/sessions/new')}
              >
                + New Issue
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                icon={<Play size={12} />}
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
                icon={<FlaskConical size={12} />}
                onClick={() => router.push('/test-lab')}
              >
                Open Test Lab
              </Button>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="flex-1">
            <CardHeader title="Activity" icon={<Clock size={13} />} />
            {activity.length === 0 ? (
              <div className="p-4 text-center">
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>No activity yet</p>
              </div>
            ) : (
              <div className="py-1">
                {activity.slice(0, 7).map((ev) => {
                  const color = ACTIVITY_COLORS[ev.type] ?? 'var(--text-muted)';
                  return (
                    <div
                      key={ev.id}
                      className="flex items-start gap-3 px-4 py-2"
                    >
                      <div
                        className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: color + '15', color }}
                      >
                        {ACTIVITY_ICONS[ev.type] ?? <Clock size={11} />}
                      </div>
                      <div className="min-w-0">
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

function FolderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
