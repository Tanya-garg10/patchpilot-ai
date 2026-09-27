'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, Plus, Bug, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getProjects, getSessions, saveProject } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { Project } from '@/lib/types';
import { SHOPSTACK_PROJECT } from '@/lib/demo-data';
import { runDemo } from '@/lib/run-demo';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [demoRunning, setDemoRunning] = useState(false);

  function reload() {
    const p = getProjects();
    setProjects(p);
    const sessions = getSessions();
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      counts[s.projectId] = (counts[s.projectId] ?? 0) + 1;
    });
    setSessionCounts(counts);
  }

  useEffect(() => { reload(); }, []);

  async function handleRunDemo() {
    setDemoRunning(true);
    try {
      const id = await runDemo();
      reload();
      router.push(`/sessions/${id}`);
    } finally {
      setDemoRunning(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" icon={<Play size={13} />} loading={demoRunning} onClick={handleRunDemo}>
            Load Demo
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOpen size={28} />}
            title="No projects"
            description="Run the ShopStack demo to load the example project."
            action={
              <Button variant="primary" size="sm" loading={demoRunning} onClick={handleRunDemo}>
                Run Demo
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((p) => (
            <Card key={p.id} elevated>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.description}</div>
                    </div>
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                    >
                      <FolderOpen size={16} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <InfoRow label="Repository" value={p.repository} />
                    <InfoRow label="Language" value={p.language} />
                    <InfoRow label="Framework" value={p.framework} />
                    <InfoRow label="Created" value={formatDate(p.createdAt)} />
                  </div>

                  <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Bug size={12} />
                      <span>{sessionCounts[p.id] ?? 0} debug session(s)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/sessions?project=${p.id}`)}
                    >
                      View Sessions
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xs mono truncate max-w-40" style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}
