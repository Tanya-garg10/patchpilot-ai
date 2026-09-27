'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Bug, CheckCircle, FileCode, FlaskConical, Plus, Zap, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { getActivity } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';
import { ActivityEvent, ActivityEventType } from '@/lib/types';

const EVENT_ICONS: Record<ActivityEventType, React.ReactNode> = {
  bug_report_created: <Bug size={14} />,
  analysis_started: <Zap size={14} />,
  root_cause_identified: <Zap size={14} />,
  fix_generated: <FileCode size={14} />,
  diff_reviewed: <FileCode size={14} />,
  fix_applied: <CheckCircle size={14} />,
  tests_generated: <FlaskConical size={14} />,
  tests_executed: <FlaskConical size={14} />,
  verification_completed: <CheckCircle size={14} />,
  pr_summary_created: <FileCode size={14} />,
  session_created: <Plus size={14} />,
  session_closed: <CheckCircle size={14} />,
};

const EVENT_COLORS: Record<ActivityEventType, string> = {
  bug_report_created: '#3b82d4',
  analysis_started: '#8b5cf6',
  root_cause_identified: '#06b6d4',
  fix_generated: '#f97316',
  diff_reviewed: '#f97316',
  fix_applied: '#22c55e',
  tests_generated: '#8b5cf6',
  tests_executed: '#eab308',
  verification_completed: '#22c55e',
  pr_summary_created: '#3b82d4',
  session_created: '#8b97a8',
  session_closed: '#8b97a8',
};

export default function ActivityPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setEvents(getActivity());
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Activity</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Full timeline of PatchPilot events
          </p>
        </div>
      </div>

      <Card>
        {events.length === 0 ? (
          <EmptyState
            icon={<Activity size={28} />}
            title="No activity yet"
            description="Run the ShopStack demo or start a debug session to see activity."
            action={
              <Button variant="primary" size="sm" onClick={() => router.push('/')}>
                Go to Dashboard
              </Button>
            }
          />
        ) : (
          <div className="p-4">
            <div className="space-y-0">
              {events.map((ev, i) => {
                const icon = EVENT_ICONS[ev.type] ?? <Clock size={14} />;
                const color = EVENT_COLORS[ev.type] ?? '#8b97a8';
                return (
                  <div key={ev.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: color + '18', color, border: `1.5px solid ${color}44` }}
                      >
                        {icon}
                      </div>
                      {i < events.length - 1 && (
                        <div className="w-px flex-1 my-0.5" style={{ background: 'var(--border)', minHeight: 20 }} />
                      )}
                    </div>
                    <div className="pb-5 min-w-0">
                      <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {ev.description}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDateTime(ev.createdAt)}
                        </span>
                        {ev.sessionId && (
                          <button
                            className="text-xs underline"
                            style={{ color: 'var(--text-muted)' }}
                            onClick={() => router.push(`/sessions/${ev.sessionId}`)}
                          >
                            View session
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
