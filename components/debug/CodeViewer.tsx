'use client';

import { cn } from '@/lib/utils';

interface CodeViewerProps {
  code: string;
  language?: string;
  suspiciousLines?: number[];
}

export function CodeViewer({ code, suspiciousLines = [] }: CodeViewerProps) {
  const lines = code.split('\n');

  return (
    <div className="overflow-auto h-full">
      <table className="w-full border-collapse" style={{ fontFamily: 'ui-monospace, "Cascadia Code", monospace', fontSize: 12 }}>
        <tbody>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isSuspicious = suspiciousLines.includes(lineNum);
            return (
              <tr
                key={i}
                className={cn(
                  'group',
                  isSuspicious && 'bg-yellow-500/10'
                )}
              >
                <td
                  className="select-none pl-4 pr-3 text-right w-10"
                  style={{
                    color: isSuspicious ? '#eab308' : 'var(--text-muted)',
                    borderRight: '1px solid var(--border-subtle)',
                    userSelect: 'none',
                    verticalAlign: 'top',
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  {lineNum}
                </td>
                <td
                  className="pl-4 pr-4 whitespace-pre"
                  style={{
                    color: isSuspicious ? '#fde68a' : 'var(--text-primary)',
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  {isSuspicious && (
                    <span
                      className="mr-2 text-xs"
                      style={{ color: '#eab308' }}
                      title="Suspicious line identified by analysis"
                    >
                      ⚠
                    </span>
                  )}
                  {line}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
