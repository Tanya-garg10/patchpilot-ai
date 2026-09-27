'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, Plus, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getSessions, getProjects } from '@/lib/store';
import { formatRelative, sessionStatusLabel, sessionStatusColor } from '@/lib/utils';
import { DebugSession, Project } from '@/lib/types';
import { runDemo } from '@/lib/run-demo';

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
      router.push(`/sessions/${id}`);
    } finally {
      setDemoRunning(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Debug Sessions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={<Play size={13} />} loading={demoRunning} onClick={handleRunDemo}>
            Run Demo
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => router.push('/sessions/new')}>
            New Session
          </Button>
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sessions..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bug size={32} />}
            title="No debug sessions"
            description="Start a new session or run the ShopStack demo to see PatchPilot in action."
            action={
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" loading={demoRunning} onClick={handleRunDemo}>
                  Run Demo
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/sessions/new')}>
                  New Session
                </Button>
              </div>
            }
          />
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between gap-4 px-4 py-4 cursor-pointer hover:bg-white/3 transition-colors"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
              onClick={() => router.push(`/sessions/${s.id}`)}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                >
                  <Bug size={14} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {getProjectName(s.projectId)} · {formatRelative(s.createdAt)}
                  </div>
                  <div className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    {s.bugReport}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-medium ${sessionStatusColor(s.status)}`}>
                  {sessionStatusLabel(s.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
