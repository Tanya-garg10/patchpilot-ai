'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bug,
  FolderOpen,
  FlaskConical,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/',          label: 'Overview',       icon: LayoutDashboard, group: 'main' },
  { href: '/sessions',  label: 'Debug Sessions',  icon: Bug,             group: 'main' },
  { href: '/projects',  label: 'Projects',        icon: FolderOpen,      group: 'main' },
  { href: '/test-lab',  label: 'Test Lab',         icon: FlaskConical,    group: 'main' },
  { href: '/activity',  label: 'Activity',         icon: Activity,        group: 'main' },
  { href: '/settings',  label: 'Settings',         icon: Settings,        group: 'bottom' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? 52 : 220,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── Logo ──────────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-3 flex-shrink-0"
        style={{ height: 52, borderBottom: '1px solid var(--border)' }}
      >
        {/* Crosshair + bracket logo mark */}
        <div
          className="flex items-center justify-center flex-shrink-0 relative"
          style={{
            width: 28,
            height: 28,
            border: '1px solid rgba(0,212,255,0.35)',
            borderRadius: 6,
            background: 'rgba(0,212,255,0.06)',
          }}
        >
          {/* Center dot */}
          <div
            className="absolute rounded-full"
            style={{ width: 4, height: 4, background: 'var(--cyan)' }}
          />
          {/* Crosshair lines */}
          <div className="absolute" style={{ width: 1, height: 8, top: 2, background: 'rgba(0,212,255,0.5)' }} />
          <div className="absolute" style={{ width: 1, height: 8, bottom: 2, background: 'rgba(0,212,255,0.5)' }} />
          <div className="absolute" style={{ height: 1, width: 8, left: 2, background: 'rgba(0,212,255,0.5)' }} />
          <div className="absolute" style={{ height: 1, width: 8, right: 2, background: 'rgba(0,212,255,0.5)' }} />
        </div>

        {!collapsed && (
          <div>
            <div
              className="font-bold text-sm tracking-tight leading-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              PatchPilot
            </div>
            <div
              className="text-xs leading-tight"
              style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.05em' }}
            >
              DEBUG ENGINE
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 py-2 px-1.5 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.filter(i => i.group === 'main').map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'relative flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-all duration-150 group',
                active ? 'font-medium' : 'hover:bg-white/[0.03]'
              )}
              style={{
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(0,212,255,0.06)' : undefined,
              }}
            >
              {/* Active indicator */}
              {active && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 rounded-r-full"
                  style={{ width: 2, background: 'var(--cyan)' }}
                />
              )}
              <Icon
                size={14}
                className="flex-shrink-0"
                style={{ color: active ? 'var(--cyan)' : undefined, opacity: active ? 1 : 0.7 }}
              />
              {!collapsed && (
                <span style={{ fontSize: 12.5 }}>{label}</span>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        {!collapsed && (
          <div className="mx-2 my-1" style={{ height: 1, background: 'var(--border)' }} />
        )}

        {NAV_ITEMS.filter(i => i.group === 'bottom').map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'relative flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-all duration-150',
                active ? 'font-medium' : 'hover:bg-white/[0.03]'
              )}
              style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 rounded-r-full" style={{ width: 2, background: 'var(--cyan)' }} />
              )}
              <Icon size={14} className="flex-shrink-0" style={{ opacity: 0.7 }} />
              {!collapsed && <span style={{ fontSize: 12.5 }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── AI Engine Status ───────────────────────────── */}
      {!collapsed && (
        <div
          className="mx-2 mb-2 px-3 py-2 rounded-md"
          style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}
        >
          <div className="flex items-center gap-2">
            <Cpu size={11} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--cyan)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
              AI ENGINE
            </span>
            <span
              className="animate-pulse-slow rounded-full ml-auto"
              style={{ width: 5, height: 5, background: 'var(--green)', flexShrink: 0 }}
            />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace', marginTop: 2, letterSpacing: '0.04em' }}>
            ONLINE · DEMO MODE
          </div>
        </div>
      )}

      {/* ── Collapse Toggle ────────────────────────────── */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center hover:bg-white/[0.03] transition-colors flex-shrink-0"
        style={{
          height: 36,
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}
