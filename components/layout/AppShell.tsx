'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { CommandPalette } from './CommandPalette';
import { runDemo } from '@/lib/run-demo';
import { useRouter } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);

  // AI mode: in future, read from env/settings.
  // Currently always 'demo' unless EVOROZEN_API_KEY would be set server-side.
  const aiMode: 'evorozen' | 'demo' = 'demo';

  async function handleRunDemo() {
    if (demoRunning) return;
    setDemoRunning(true);
    try {
      const id = await runDemo();
      router.push(`/sessions/${id}`);
    } finally {
      setDemoRunning(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        aiMode={aiMode}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-primary)' }}>
          {children}
        </main>
      </div>
      {/* Global Command Palette — Ctrl/Cmd+K */}
      <CommandPalette onRunDemo={handleRunDemo} />
    </div>
  );
}
