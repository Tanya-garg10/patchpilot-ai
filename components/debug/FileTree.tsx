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
      <div className="label-mono px-3 pb-2" style={{ fontSize: 8 }}>
        FILES
      </div>
      {Object.entries(grouped).map(([dir, dirFiles]) => (
        <div key={dir}>
          {dir && (
            <div
              className="px-3 py-0.5"
              style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}
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
                  'w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors',
                  dir ? 'pl-5' : '',
                  !isSelected && 'hover:bg-white/[0.03]'
                )}
                style={{
                  background: isSelected ? 'rgba(0,212,255,0.06)' : 'transparent',
                  borderLeft: isSelected ? '2px solid var(--cyan)' : '2px solid transparent',
                  color: isSelected ? 'var(--cyan)' : isSuspicious ? '#f97316' : 'var(--text-secondary)',
                }}
                title={file}
              >
                {isSuspicious ? (
                  <AlertTriangle size={10} className="flex-shrink-0" style={{ color: '#f97316' }} />
                ) : (
                  <FileCode size={10} className="flex-shrink-0" style={{ opacity: 0.6 }} />
                )}
                <span className="truncate mono" style={{ fontSize: 11 }}>{name}</span>
                {isSuspicious && (
                  <span
                    className="ml-auto flex-shrink-0 rounded-full"
                    style={{ width: 4, height: 4, background: '#f97316' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
