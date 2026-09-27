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
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sessions', label: 'Debug Sessions', icon: Bug },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/test-lab', label: 'Test Lab', icon: FlaskConical },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
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
        width: collapsed ? 56 : 220,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-3 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', height: 56 }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-md"
          style={{
            width: 32,
            height: 32,
            background: 'var(--accent)',
          }}
        >
          <Zap size={16} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
              PatchPilot
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              v0.1.0
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'font-medium'
                  : 'hover:bg-white/5'
              )}
              style={{
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-glow)' : undefined,
              }}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center py-3 hover:bg-white/5 transition-colors"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          height: 44,
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
