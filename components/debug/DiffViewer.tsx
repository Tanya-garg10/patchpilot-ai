'use client';

import { FileDiff } from '@/lib/types';

interface DiffViewerProps {
  diff: FileDiff;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  const beforeLines = diff.before.split('\n');
  const afterLines = diff.after.split('\n');

  return (
    <div
      className="rounded-md overflow-hidden mb-4"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-medium mono" style={{ color: 'var(--text-secondary)' }}>
          {diff.file}
        </span>
      </div>

      <div
        className="text-xs px-4 py-2"
        style={{ background: 'rgba(59,130,212,0.06)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        {diff.explanation}
      </div>

      <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--border)' }}>
        {/* Before */}
        <div>
          <div
            className="px-3 py-1.5 text-xs font-medium flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid var(--border)', color: '#ef4444' }}
          >
            <span>−</span> BEFORE
          </div>
          <div className="overflow-auto" style={{ background: '#0e1117' }}>
            {beforeLines.map((line, i) => (
              <div
                key={i}
                className="flex"
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              >
                <span
                  className="select-none w-8 text-right pr-3 flex-shrink-0"
                  style={{ color: 'var(--text-muted)', paddingTop: 2, paddingBottom: 2 }}
                >
                  {i + 1}
                </span>
                <span
                  className="px-2 py-0.5 whitespace-pre flex-1"
                  style={{ color: '#fca5a5' }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* After */}
        <div>
          <div
            className="px-3 py-1.5 text-xs font-medium flex items-center gap-2"
            style={{ background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid var(--border)', color: '#22c55e' }}
          >
            <span>+</span> AFTER
          </div>
          <div className="overflow-auto" style={{ background: '#0e1117' }}>
            {afterLines.map((line, i) => (
              <div
                key={i}
                className="flex"
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              >
                <span
                  className="select-none w-8 text-right pr-3 flex-shrink-0"
                  style={{ color: 'var(--text-muted)', paddingTop: 2, paddingBottom: 2 }}
                >
                  {i + 1}
                </span>
                <span
                  className="px-2 py-0.5 whitespace-pre flex-1"
                  style={{ color: '#bbf7d0' }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
