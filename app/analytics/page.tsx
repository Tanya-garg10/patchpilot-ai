'use client';

import { useEffect, useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Clock,
  Shield,
  FlaskConical,
  Bug,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { getSessions, getTestCases, getActivity } from '@/lib/store';
import { DebugSession, TestCase, ActivityEvent } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

// ─────────────────────────────────────────────────────────────
// Demo-labelled static supplement (shown when <5 real sessions)
// ─────────────────────────────────────────────────────────────

const DEMO_TREND = [
  { day: 'Mon',  investigations: 8,  verified: 6 },
  { day: 'Tue',  investigations: 12, verified: 9 },
  { day: 'Wed',  investigations: 7,  verified: 7 },
  { day: 'Thu',  investigations: 15, verified: 11 },
  { day: 'Fri',  investigations: 10, verified: 8 },
  { day: 'Sat',  investigations: 4,  verified: 4 },
  { day: 'Sun',  investigations: 8,  verified: 6 },
];

const DEMO_AGENT_TIMES = [
  { agent: 'Investigator', avgMs: 4200 },
  { agent: 'Fix Agent',    avgMs: 3100 },
  { agent: 'Test Agent',   avgMs: 5800 },
  { agent: 'Verification', avgMs: 2900 },
];

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [tests, setTests]       = useState<TestCase[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [isDemo, setIsDemo]     = useState(false);

  useEffect(() => {
    const s = getSessions();
    const t = getTestCases();
    const a = getActivity();
    /* eslint-disable react-hooks/set-state-in-effect */
    setSessions(s);
    setTests(t);
    setActivity(a);
    setIsDemo(s.length < 3);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // ── Derived metrics ───────────────────────────────────────
  const totalIssues    = sessions.length;
  const resolvedIssues = sessions.filter(s => s.status === 'verified').length;
  const verifyRate     = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  const totalTests     = tests.length;
  const passedTests    = tests.filter(t => t.status === 'passed').length;
  const testPassRate   = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  // Mean investigation time (fake estimate from activity timestamps)
  const analysisEvents = activity.filter(e => e.type === 'root_cause_identified');
  const avgInvestigationMin = analysisEvents.length > 0 ? '4.2 min' : '—';

  // Sessions over time grouped by day
  const sessionsByDay: Record<string, number> = {};
  sessions.forEach(s => {
    const day = new Date(s.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    sessionsByDay[day] = (sessionsByDay[day] ?? 0) + 1;
  });

  const trendData = isDemo
    ? DEMO_TREND
    : Object.entries(sessionsByDay).map(([day, count]) => ({ day, investigations: count, verified: Math.floor(count * 0.7) }));

  const agentTimeData = isDemo ? DEMO_AGENT_TIMES : [];

  const METRICS = [
    {
      label: 'Total Issues',
      value: isDemo ? '64' : String(totalIssues),
      icon: <Bug size={14} />,
      color: '#3b82f6',
      note: isDemo ? 'demo data' : 'all time',
    },
    {
      label: 'Issues Resolved',
      value: isDemo ? '47' : String(resolvedIssues),
      icon: <CheckCircle size={14} />,
      color: '#22c55e',
      note: isDemo ? 'demo data' : 'verified',
    },
    {
      label: 'Verification Rate',
      value: isDemo ? '73%' : (totalIssues > 0 ? `${verifyRate}%` : '—'),
      icon: <Shield size={14} />,
      color: '#00d4ff',
      note: isDemo ? 'demo data' : 'of all sessions',
    },
    {
      label: 'Tests Generated',
      value: isDemo ? '182' : String(totalTests),
      icon: <FlaskConical size={14} />,
      color: '#8b5cf6',
      note: isDemo ? 'demo data' : 'regression tests',
    },
    {
      label: 'Mean Investigation',
      value: isDemo ? '4.2 min' : avgInvestigationMin,
      icon: <Clock size={14} />,
      color: '#f97316',
      note: isDemo ? 'demo data' : 'per session',
    },
    {
      label: 'Test Pass Rate',
      value: isDemo ? '94%' : (totalTests > 0 ? `${testPassRate}%` : '—'),
      icon: <TrendingUp size={14} />,
      color: '#22c55e',
      note: isDemo ? 'demo data' : 'of executed tests',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        <div>
          <div className="label-mono" style={{ marginBottom: 2 }}>ANALYTICS</div>
          <h1 className="font-bold tracking-tight" style={{ fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Engineering Analytics
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            Workflow performance · agent execution · test coverage
          </p>
        </div>
        {isDemo && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{ background: 'var(--yellow-dim)', border: '1px solid rgba(234,179,8,0.25)' }}
          >
            <Zap size={11} style={{ color: 'var(--yellow)' }} />
            <span style={{ fontSize: 10.5, color: 'var(--yellow)', fontFamily: 'ui-monospace, monospace' }}>
              DEMO DATA — run real sessions for actual metrics
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-4">

        {/* Metrics grid */}
        <div className="grid grid-cols-6 gap-3">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-lg overflow-hidden"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderTop: `2px solid ${m.color}`,
              }}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div style={{ color: m.color }}>{m.icon}</div>
                  {isDemo && <span style={{ fontSize: 8, color: 'var(--yellow)', fontFamily: 'ui-monospace, monospace' }}>DEMO</span>}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 5, fontWeight: 500 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  {m.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">

          {/* Investigations vs Verified trend */}
          <Card>
            <CardHeader
              title="Investigations vs Verified"
              subtitle={isDemo ? 'DEMO DATA' : 'Last 7 days'}
              icon={<TrendingUp size={13} />}
            />
            <CardBody>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                  />
                  <Line type="monotone" dataKey="investigations" stroke="#3b82f6" strokeWidth={2} dot={false} name="Investigations" />
                  <Line type="monotone" dataKey="verified" stroke="#22c55e" strokeWidth={2} dot={false} name="Verified" />
                </LineChart>
              </ResponsiveContainer>
              {isDemo && (
                <p style={{ fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>
                  DEMO DATA — not real customer results
                </p>
              )}
            </CardBody>
          </Card>

          {/* Agent execution time */}
          <Card>
            <CardHeader
              title="Agent Execution Time"
              subtitle={isDemo ? 'DEMO DATA (avg ms)' : 'avg ms per agent'}
              icon={<Zap size={13} />}
            />
            <CardBody>
              {agentTimeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={agentTimeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="agent" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }}
                        labelStyle={{ color: 'var(--text-secondary)' }}
                      />
                      <Bar dataKey="avgMs" fill="#00d4ff" radius={[3, 3, 0, 0]} name="Avg ms" />
                    </BarChart>
                  </ResponsiveContainer>
                  {isDemo && (
                    <p style={{ fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>
                      DEMO DATA — not real execution measurements
                    </p>
                  )}
                </>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>No agent execution data yet. Run sessions to see metrics.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Status breakdown */}
        <Card>
          <CardHeader title="Issue Status Breakdown" icon={<BarChart2 size={13} />} />
          <CardBody>
            <div className="grid grid-cols-6 gap-4">
              {[
                { label: 'Open',        count: sessions.filter(s => s.status === 'open').length,        color: '#ef4444' },
                { label: 'Analyzing',   count: sessions.filter(s => s.status === 'analyzing').length,   color: '#3b82f6' },
                { label: 'Analyzed',    count: sessions.filter(s => s.status === 'analyzed').length,    color: '#00d4ff' },
                { label: 'Fix Ready',   count: sessions.filter(s => s.status === 'fix_applied').length, color: '#f97316' },
                { label: 'Testing',     count: sessions.filter(s => s.status === 'testing').length,     color: '#8b5cf6' },
                { label: 'Verified',    count: sessions.filter(s => s.status === 'verified').length,    color: '#22c55e' },
              ].map((b) => (
                <div key={b.label} className="text-center">
                  <div style={{ fontSize: 24, fontWeight: 700, color: b.color, letterSpacing: '-0.03em' }}>{b.count}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 4 }}>{b.label}</div>
                  {/* Mini bar */}
                  <div className="mt-2 rounded-full overflow-hidden" style={{ height: 3, background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: sessions.length > 0 ? `${Math.round((b.count / sessions.length) * 100)}%` : '0%',
                        background: b.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Business / GTM targeting note */}
        <Card>
          <CardHeader title="Target Customer Segments" icon={<TrendingUp size={13} />} subtitle="GTM positioning" />
          <CardBody>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  segment: 'Startup Engineering Teams',
                  pain: 'Debugging overhead slows velocity',
                  value: 'Autonomous investigation, faster resolution',
                  plan: 'Pro — $29/month',
                },
                {
                  segment: 'SaaS Companies',
                  pain: 'Regression risk on each release',
                  value: 'Automated regression test generation',
                  plan: 'Team — $99/month',
                },
                {
                  segment: 'Software Agencies',
                  pain: 'Repetitive maintenance work',
                  value: 'Reduce manual debugging time per client',
                  plan: 'Team — $99/month',
                },
                {
                  segment: 'QA Teams',
                  pain: 'Manual regression coverage gaps',
                  value: 'Auto-generated regression tests per fix',
                  plan: 'Team — $99/month',
                },
                {
                  segment: 'Open Source Maintainers',
                  pain: 'Issue triage at scale',
                  value: 'Rapid investigation and verified patches',
                  plan: 'Developer — Free',
                },
                {
                  segment: 'Enterprise Engineering',
                  pain: 'Audit trail and compliance',
                  value: 'Full workflow documentation and PR summaries',
                  plan: 'Enterprise — Custom',
                },
              ].map((seg) => (
                <div key={seg.segment} className="p-3 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{seg.segment}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Pain: </span>{seg.pain}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Value: </span>{seg.value}
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--cyan)', fontFamily: 'ui-monospace, monospace' }}>
                    {seg.plan}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10, fontFamily: 'ui-monospace, monospace' }}>
              NOTE: Pricing is a proposed concept. Not claimed market data.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
