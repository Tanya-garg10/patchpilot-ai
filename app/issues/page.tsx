'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Plus,
  Play,
  Search,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getSessions, getProjects } from '@/lib/store';
import { formatRelative } from '@/lib/utils';
import { DebugSession, Project } from '@/lib/types';
import { runDemo } from '@/lib/run-demo';

// Status → severity mapping for issues view
const SEVERITY: Record<string, { label: string; color: string; bg: string }> = {
  open:         { label: 'HIGH',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  analyzing:    { label: 'HIGH',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  analyzed:     { label: 'MEDIUM',     color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  fix_ready:    { label: 'MEDIUM',     color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  fix_applied:  { label: 'LOW',        color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  testing:      { label: 'LOW',        color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  verified:     { label: 'RESOLVED',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  closed:       { label: 'CLOSED',     color: 'var(--text-muted)', bg: 'transparent' },
};

const WORKFLOW_STATUS: Record<string, string> = {
  open:         'Investigating',
  analyzing:    'Investigating',
  analyzed:     'Root Cause Found',
  fix_ready:    'Fix Ready',
  fix_applied:  'Testing',
  testing:      'Testing',
  verified:     'Verified',
  closed:       'Closed',
};

type Filter = 'all' | 'open' | 'investigating' | 'fix_ready' | 'testing' | 'verified';

function makeBugId(idx: number) {
  return `BUG-${1000 + idx}`;
}

export default function IssuesPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSessions(getSessions());
    setProjects(getProjects());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const sorted = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const filtered = sorted.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'all') return true;
    if (filter === 'open') return s.status === 'open';
    if (filter === 'investigating') return ['analyzing', 'analyzed'].includes(s.status);
    if (filter === 'fix_ready') return ['fix_ready', 'fix_applied'].includes(s.status);
    if (filter === 'testing') return s.status === 'testing';
    if (filter === 'verified') return s.status === 'verified';
    return true;
  });

  function getProjectName(projectId: string) {
    return projects.find((p) => p.id === projectId)?.name ?? projectId;
  }

  async function handleRunDemo() {
    setDemoRunning(true);
    try {
      const id = await runDemo();
      setSessions(getSessions());
      setProjects(getProjects());
      router.push(`/sessions/${id}`);
    } finally {
      setDemoRunning(false);
    }
  }

  const FILTERS: { id: Filter; label: string; count: number }[] = [
    { id: 'all',           label: 'All',          count: sessions.length },
    { id: 'open',          label: 'Open',          count: sessions.filter(s => s.status === 'open').length },
    { id: 'investigating', label: 'Investigating', count: sessions.filter(s => ['analyzing','analyzed'].includes(s.status)).length },
    { id: 'fix_ready',     label: 'Fix Ready',     count: sessions.filter(s => ['fix_ready','fix_applied'].includes(s.status)).length },
    { id: 'testing',       label: 'Testing',       count: sessions.filter(s => s.status === 'testing').length },
    { id: 'verified',      label: 'Verified',      count: sessions.filter(s => s.status === 'verified').length },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between gap-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        <div>
          <div className="label-mono" style={{ marginBottom: 2 }}>ISSUE INBOX</div>
          <h1 className="font-bold tracking-tight" style={{ fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Issues
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {sessions.length} issue{sessions.length !== 1 ? 's' : ''} · from report to verified fix
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Play size={12} />} loading={demoRunning} onClick={handleRunDemo}>
            Load Demo
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={12} />} onClick={() => router.push('/sessions/new')}>
            + New Issue
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-0 px-5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors relative"
            style={{
              color: filter === f.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: filter === f.id ? '2px solid var(--cyan)' : '2px solid transparent',
            }}
          >
            {f.label}
            {f.count > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5"
                style={{ fontSize: 9, background: filter === f.id ? 'var(--cyan-dim)' : 'var(--bg-elevated)', color: filter === f.id ? 'var(--cyan)' : 'var(--text-muted)' }}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-5 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', maxWidth: 400 }}
        >
          <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 12.5, color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Issue list */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} />}
            title="No issues"
            description="Load the ShopStack demo to see BUG-1042, or create a new issue."
            action={
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" loading={demoRunning} onClick={handleRunDemo}>
                  Load Demo
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/sessions/new')}>
                  New Issue
                </Button>
              </div>
            }
          />
        ) : (
          <div>
            {/* Table header */}
            <div
              className="grid px-5 py-2"
              style={{
                gridTemplateColumns: '80px 1fr 120px 100px 120px 100px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                gap: '0.75rem',
              }}
            >
              {['Issue ID', 'Title', 'Repository', 'Severity', 'Status', ''].map((h) => (
                <div key={h} className="label-mono" style={{ fontSize: 9 }}>{h}</div>
              ))}
            </div>

            {filtered.map((s, i) => {
              const sev = SEVERITY[s.status] ?? SEVERITY.open;
              const workflowStatus = WORKFLOW_STATUS[s.status] ?? s.status;
              const bugId = s.id === 'shopstack-bug-1042' ? 'BUG-1042' : makeBugId(i);
              return (
                <div
                  key={s.id}
                  className="grid items-center px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{
                    gridTemplateColumns: '80px 1fr 120px 100px 120px 100px',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: '0.75rem',
                  }}
                  onClick={() => router.push(`/sessions/${s.id}`)}
                >
                  {/* Bug ID */}
                  <div className="font-mono" style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 600 }}>
                    {bugId}
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <div className="font-medium truncate" style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {s.title}
                    </div>
                    <div className="truncate" style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>
                      {s.bugReport.slice(0, 70)}…
                    </div>
                  </div>

                  {/* Repository */}
                  <div className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {getProjectName(s.projectId)}
                  </div>

                  {/* Severity */}
                  <div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: sev.bg, color: sev.color, fontSize: 10, letterSpacing: '0.05em' }}
                    >
                      {sev.label}
                    </span>
                  </div>

                  {/* Workflow status */}
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {workflowStatus}
                  </div>

                  {/* Created + arrow */}
                  <div className="flex items-center justify-end gap-1.5" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                    <Clock size={10} />
                    <span>{formatRelative(s.createdAt)}</span>
                    <ChevronRight size={11} style={{ color: 'var(--text-muted)', marginLeft: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
