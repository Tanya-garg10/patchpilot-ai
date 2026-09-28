'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, Plus, Play, Search, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getSessions, getProjects } from '@/lib/store';
import { formatRelative, sessionStatusLabel, sessionStatusColor } from '@/lib/utils';
import { DebugSession, Project } from '@/lib/types';
import { runDemo } from '@/lib/run-demo';

const STATUS_DOT_COLORS: Record<string, string> = {
  open:         '#eab308',
  analyzing:    '#3b82f6',
  analyzed:     '#00d4ff',
  fix_ready:    '#8b5cf6',
  fix_applied:  '#f97316',
  testing:      '#3b82f6',
  verified:     '#22c55e',
  closed:       'var(--text-muted)',
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    setSessions(getSessions());
    setProjects(getProjects());
  }, []);

  const filtered = sessions
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between gap-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        <div>
          <div className="label-mono" style={{ marginBottom: 2 }}>DEBUG SESSIONS</div>
          <h1 className="font-bold tracking-tight" style={{ fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Debug Sessions
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} · full debug workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Play size={12} />} loading={demoRunning} onClick={handleRunDemo}>
            Load Demo
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={12} />} onClick={() => router.push('/sessions/new')}>
            New Session
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', maxWidth: 400 }}
        >
          <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 12.5, color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bug size={28} />}
            title="No debug sessions"
            description="Start a new session or run the ShopStack demo to see PatchPilot in action."
            action={
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" loading={demoRunning} onClick={handleRunDemo}>
                  Load Demo
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/sessions/new')}>
                  New Session
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
                gridTemplateColumns: '1fr auto auto auto',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
              }}
            >
              {['Session', 'Project', 'Created', 'Status'].map((h) => (
                <div key={h} className="label-mono" style={{ fontSize: 9 }}>{h}</div>
              ))}
            </div>

            {filtered.map((s) => {
              const dotColor = STATUS_DOT_COLORS[s.status] ?? 'var(--text-muted)';
              return (
                <div
                  key={s.id}
                  className="grid items-center px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{
                    gridTemplateColumns: '1fr auto auto auto',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: '1rem',
                  }}
                  onClick={() => router.push(`/sessions/${s.id}`)}
                >
                  {/* Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                    >
                      <Bug size={11} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="font-medium truncate"
                        style={{ fontSize: 13, color: 'var(--text-primary)' }}
                      >
                        {s.title}
                      </div>
                      <div
                        className="truncate"
                        style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}
                      >
                        {s.bugReport.slice(0, 80)}…
                      </div>
                    </div>
                  </div>

                  {/* Project */}
                  <div
                    className="mono text-right"
                    style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
                  >
                    {getProjectName(s.projectId)}
                  </div>

                  {/* Time */}
                  <div
                    className="flex items-center gap-1 text-right"
                    style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
                  >
                    <Clock size={10} />
                    {formatRelative(s.createdAt)}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 justify-end">
                    <div
                      className="rounded-full flex-shrink-0 animate-pulse-slow"
                      style={{ width: 5, height: 5, background: dotColor }}
                    />
                    <span
                      className="font-medium"
                      style={{ fontSize: 11, color: dotColor, whiteSpace: 'nowrap' }}
                    >
                      {sessionStatusLabel(s.status)}
                    </span>
                    <ChevronRight size={11} style={{ color: 'var(--text-muted)' }} />
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
