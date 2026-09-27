'use client';

import { FileCode, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  files: string[];
  selected: string;
  suspicious: string[];
  onSelect: (file: string) => void;
}

export function FileTree({ files, selected, suspicious, onSelect }: FileTreeProps) {
  // Group by directory
  const grouped: Record<string, string[]> = {};
  for (const f of files) {
    const parts = f.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(f);
  }

  return (
    <div
      className="w-44 flex-shrink-0 overflow-y-auto py-2"
      style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
    >
      <div
        className="px-3 pb-2 text-xs font-medium uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        Files
      </div>
      {Object.entries(grouped).map(([dir, dirFiles]) => (
        <div key={dir}>
          {dir && (
            <div
              className="px-3 py-1 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {dir}/
            </div>
          )}
          {dirFiles.map((file) => {
            const name = file.split('/').pop() ?? file;
            const isSelected = file === selected;
            const isSuspicious = suspicious.includes(file);
            return (
              <button
                key={file}
                onClick={() => onSelect(file)}
                className={cn(
                  'w-full flex items-center gap-1.5 px-3 py-1 text-left text-xs transition-colors',
                  dir ? 'pl-6' : '',
                  isSelected ? '' : 'hover:bg-white/5'
                )}
                style={{
                  background: isSelected ? 'var(--accent-glow)' : 'transparent',
                  color: isSelected ? 'var(--accent)' : isSuspicious ? '#f97316' : 'var(--text-secondary)',
                }}
                title={file}
              >
                {isSuspicious ? (
                  <AlertTriangle size={11} className="flex-shrink-0" />
                ) : (
                  <FileCode size={11} className="flex-shrink-0" />
                )}
                <span className="truncate mono">{name}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
