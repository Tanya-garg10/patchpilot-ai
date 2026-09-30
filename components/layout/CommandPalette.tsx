'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Play,
  FolderOpen,
  FlaskConical,
  Shield,
  Users,
  BarChart2,
  Bug,
  Activity,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  onRunDemo?: () => void;
}

export function CommandPalette({ onRunDemo }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMANDS: CommandItem[] = [
    {
      id: 'new-issue',
      label: 'New Issue',
      description: 'Create a new bug report and start an investigation',
      icon: <Plus size={14} />,
      color: '#00d4ff',
      action: () => { router.push('/sessions/new'); close(); },
      keywords: ['new', 'create', 'issue', 'bug', 'report'],
    },
    {
      id: 'start-investigation',
      label: 'Start Investigation',
      description: 'Open the Investigator Agent workflow',
      icon: <Search size={14} />,
      color: '#3b82f6',
      action: () => { router.push('/sessions'); close(); },
      keywords: ['investigate', 'analyze', 'root', 'cause'],
    },
    {
      id: 'load-demo',
      label: 'Load Demo Issue',
      description: 'Load ShopStack BUG-1042 demonstration',
      icon: <Play size={14} />,
      color: '#8b5cf6',
      action: () => { if (onRunDemo) onRunDemo(); close(); },
      keywords: ['demo', 'shopstack', 'bug', '1042', 'cart'],
    },
    {
      id: 'open-issues',
      label: 'Open Issues',
      description: 'View all issues in the inbox',
      icon: <Bug size={14} />,
      color: '#ef4444',
      action: () => { router.push('/issues'); close(); },
      keywords: ['issues', 'inbox', 'bugs'],
    },
    {
      id: 'open-repository',
      label: 'Open Repository',
      description: 'Browse project repositories',
      icon: <FolderOpen size={14} />,
      color: '#f97316',
      action: () => { router.push('/projects'); close(); },
      keywords: ['repository', 'project', 'code'],
    },
    {
      id: 'run-tests',
      label: 'Run Tests',
      description: 'Open Test Lab and execute regression tests',
      icon: <FlaskConical size={14} />,
      color: '#8b5cf6',
      action: () => { router.push('/test-lab'); close(); },
      keywords: ['test', 'lab', 'regression', 'run'],
    },
    {
      id: 'generate-fix',
      label: 'View Debug Sessions',
      description: 'Browse all debug sessions and fix workflows',
      icon: <Search size={14} />,
      color: '#00d4ff',
      action: () => { router.push('/sessions'); close(); },
      keywords: ['fix', 'generate', 'patch', 'sessions'],
    },
    {
      id: 'view-verification',
      label: 'View Verification',
      description: 'Check verification status for sessions',
      icon: <Shield size={14} />,
      color: '#22c55e',
      action: () => { router.push('/sessions'); close(); },
      keywords: ['verify', 'verification', 'confirmed'],
    },
    {
      id: 'open-agents',
      label: 'Open Agents',
      description: 'View AI agent status and orchestration',
      icon: <Users size={14} />,
      color: '#f97316',
      action: () => { router.push('/agents'); close(); },
      keywords: ['agents', 'investigator', 'fix', 'test', 'orchestrator'],
    },
    {
      id: 'open-analytics',
      label: 'Open Analytics',
      description: 'View engineering metrics and insights',
      icon: <BarChart2 size={14} />,
      color: '#3b82f6',
      action: () => { router.push('/analytics'); close(); },
      keywords: ['analytics', 'metrics', 'insights', 'charts'],
    },
    {
      id: 'activity',
      label: 'View Activity',
      description: 'See the full agent activity timeline',
      icon: <Activity size={14} />,
      color: '#8b5cf6',
      action: () => { router.push('/activity'); close(); },
      keywords: ['activity', 'timeline', 'events', 'log'],
    },
  ];

  const filtered = query.trim()
    ? COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : COMMANDS;

  function close() {
    setOpen(false);
    setQuery('');
    setSelected(0);
  }

  const handleOpen = useCallback(() => {
    setOpen(true);
    setSelected(0);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) close();
        else handleOpen();
      }
      if (!open) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selected]) filtered[selected].action();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, handleOpen]);

  // Reset selection when query changes — done in the onChange handler, not an effect

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden animate-fade-in"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search commands…"
            className="flex-1 bg-transparent outline-none py-4"
            style={{ fontSize: 14, color: 'var(--text-primary)' }}
          />
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>ESC</span>
          </div>
        </div>

        {/* Results */}
        <div className="py-1 max-h-[340px] overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              No commands found
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelected(i)}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{
                  background: i === selected ? 'rgba(0,212,255,0.05)' : 'transparent',
                  borderLeft: i === selected ? '2px solid var(--cyan)' : '2px solid transparent',
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: cmd.color + '15', color: cmd.color }}
                >
                  {cmd.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {cmd.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {cmd.description}
                  </div>
                </div>
                {i === selected && (
                  <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center gap-4"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
        >
          {[
            { key: '↑↓', desc: 'navigate' },
            { key: '↵',  desc: 'select' },
            { key: 'ESC', desc: 'close' },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <kbd
                className="px-1.5 py-0.5 rounded"
                style={{ fontSize: 9.5, background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}
              >
                {item.key}
              </kbd>
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{item.desc}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            <Command size={9} />
            <span style={{ fontFamily: 'ui-monospace, monospace' }}>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
