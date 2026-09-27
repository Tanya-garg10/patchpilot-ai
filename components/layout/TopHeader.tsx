'use client';

import { Bell, HelpCircle } from 'lucide-react';

export function TopHeader() {
  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: 56,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 500 }}>
          Demo Mode
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          ShopStack bug loaded — ready to debug
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title="Help"
        >
          <HelpCircle size={16} />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title="Notifications"
        >
          <Bell size={16} />
        </button>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold"
          style={{ background: 'var(--accent)', color: '#fff' }}
          title="Developer"
        >
          D
        </div>
      </div>
    </header>
  );
}
