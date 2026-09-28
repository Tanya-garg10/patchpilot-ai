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
      {/* File header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="label-mono"
            style={{ fontSize: 9 }}
          >
            PATCH
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {diff.file}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 10, color: '#ef4444' }}>
            − {beforeLines.length} lines
          </span>
          <span style={{ fontSize: 10, color: '#22c55e' }}>
            + {afterLines.length} lines
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div
        className="px-4 py-2"
        style={{
          background: 'rgba(0,212,255,0.04)',
          borderBottom: '1px solid var(--border)',
          borderLeft: '2px solid rgba(0,212,255,0.3)',
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        {diff.explanation}
      </div>

      {/* Side-by-side diff */}
      <div className="grid grid-cols-2" style={{ borderTop: '1px solid var(--border)', minWidth: 0 }}>
        {/* Before */}
        <div style={{ borderRight: '1px solid var(--border)' }}>
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: 'rgba(239,68,68,0.06)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 10, color: '#ef4444', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
              − BEFORE
            </span>
          </div>
          <div className="overflow-auto" style={{ background: '#040609', maxHeight: 320 }}>
            {beforeLines.map((line, i) => (
              <div
                key={i}
                className="flex hover:bg-white/[0.02]"
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              >
                <span
                  className="select-none w-8 text-right pr-3 flex-shrink-0 pt-0.5 pb-0.5"
                  style={{ color: 'var(--text-muted)', fontSize: 10 }}
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
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: 'rgba(34,197,94,0.06)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
              + AFTER
            </span>
          </div>
          <div className="overflow-auto" style={{ background: '#040609', maxHeight: 320 }}>
            {afterLines.map((line, i) => (
              <div
                key={i}
                className="flex hover:bg-white/[0.02]"
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              >
                <span
                  className="select-none w-8 text-right pr-3 flex-shrink-0 pt-0.5 pb-0.5"
                  style={{ color: 'var(--text-muted)', fontSize: 10 }}
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
