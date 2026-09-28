'use client';

import { Bell, HelpCircle, Terminal } from 'lucide-react';

export function TopHeader() {
  return (
    <header
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{
        height: 52,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Left — env label */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          <span
            className="animate-blink rounded-full"
            style={{ width: 5, height: 5, background: 'var(--green)', display: 'inline-block', flexShrink: 0 }}
          />
          <span style={{ fontSize: 10, color: 'var(--cyan)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.07em' }}>
            DEMO ENVIRONMENT
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          ShopStack cart bug · ready to debug
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          className="flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-white/[0.05]"
          style={{ color: 'var(--text-muted)' }}
          title="Help"
        >
          <HelpCircle size={14} />
        </button>
        <button
          className="flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-white/[0.05]"
          style={{ color: 'var(--text-muted)' }}
          title="Notifications"
        >
          <Bell size={14} />
        </button>

        <div className="mx-2" style={{ width: 1, height: 18, background: 'var(--border)' }} />

        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded font-bold cursor-pointer"
          style={{
            width: 28,
            height: 28,
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.25)',
            color: 'var(--cyan)',
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
          }}
          title="Developer"
        >
          T
        </div>
      </div>
    </header>
  );
}
