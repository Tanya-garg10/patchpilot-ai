'use client';

import { useState } from 'react';
import { Settings, Zap, Moon, Info, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { clearAll } from '@/lib/store';

export default function SettingsPage() {
  const [demoMode] = useState(true);
  const [cleared, setCleared] = useState(false);

  function handleClear() {
    if (window.confirm('This will clear all session data from localStorage. Are you sure?')) {
      clearAll();
      setCleared(true);
      setTimeout(() => setCleared(false), 2000);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Application configuration</p>
      </div>

      {/* AI Provider */}
      <Card>
        <CardHeader title="AI Provider" subtitle="Configure the AI backend" icon={<Zap size={15} />} />
        <CardBody className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Provider Type</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Currently using <strong style={{ color: 'var(--accent)' }}>Demo Provider</strong> (deterministic ShopStack responses)
              </div>
            </div>
            <span className="tag tag-blue">Demo</span>
          </div>
          <div
            className="rounded-md p-3 text-xs"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <div className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>External AI Provider (future)</div>
            <div className="space-y-1.5">
              <EnvRow name="AI_PROVIDER" value="demo" hint="Set to 'external' to use a real AI provider" />
              <EnvRow name="AI_PROVIDER_API_KEY" value="(not set)" hint="Your AI provider API key" secret />
              <EnvRow name="AI_PROVIDER_ENDPOINT" value="(not set)" hint="AI provider endpoint URL" />
              <EnvRow name="AI_PROVIDER_MODEL" value="(not set)" hint="Model identifier" />
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Secret values are never displayed. Set them in your .env.local file.
          </p>
        </CardBody>
      </Card>

      {/* Demo Mode */}
      <Card>
        <CardHeader title="Demo Mode" subtitle="ShopStack demonstration settings" icon={<Info size={15} />} />
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Demo Mode Active</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Uses DemoProvider with deterministic ShopStack responses</div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-5 rounded-full relative"
                style={{ background: demoMode ? 'var(--accent)' : 'var(--border)' }}
              >
                <div
                  className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                  style={{
                    background: '#fff',
                    left: demoMode ? 22 : 2,
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {demoMode ? 'On' : 'Off'}
              </span>
            </div>
          </div>
          <div
            className="rounded-md p-3 text-xs"
            style={{ background: 'rgba(59,130,212,0.06)', border: '1px solid var(--accent-dim)', color: 'var(--text-secondary)' }}
          >
            Demo mode uses the DemoProvider class which returns pre-defined, deterministic analysis results for the ShopStack cart bug. No external AI calls are made.
          </div>
        </CardBody>
      </Card>

      {/* Project info */}
      <Card>
        <CardHeader title="About PatchPilot" icon={<Zap size={15} />} />
        <CardBody className="space-y-2">
          {[
            { label: 'Version', value: '0.1.0' },
            { label: 'Built with', value: 'Next.js 16, TypeScript, Tailwind CSS' },
            { label: 'Storage', value: 'Browser localStorage' },
            { label: 'AI Provider', value: 'DemoProvider (ShopStack)' },
            { label: 'IBM Bob', value: 'Core development environment' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{value}</span>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader title="Data Management" icon={<Trash2 size={15} />} />
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Clear All Data</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Removes all sessions, projects, tests and activity from localStorage.
              </div>
            </div>
            <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={handleClear}>
              {cleared ? 'Cleared!' : 'Clear Data'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function EnvRow({ name, value, hint, secret }: {
  name: string;
  value: string;
  hint: string;
  secret?: boolean;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="mono" style={{ color: '#a5f3fc' }}>{name}</div>
        <div style={{ color: 'var(--text-muted)' }}>{hint}</div>
      </div>
      <div className="flex items-center gap-1">
        <span className="mono" style={{ color: 'var(--text-muted)' }}>
          {secret ? (shown ? value : '••••••••') : value}
        </span>
        {secret && (
          <button onClick={() => setShown(!shown)} style={{ color: 'var(--text-muted)' }}>
            {shown ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        )}
      </div>
    </div>
  );
}
