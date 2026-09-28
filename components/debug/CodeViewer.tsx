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
    <div className="overflow-auto h-full" style={{ background: '#040609' }}>
      <table
        className="w-full border-collapse"
        style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12 }}
      >
        <tbody>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isSuspicious = suspiciousLines.includes(lineNum);
            return (
              <tr
                key={i}
                className={cn('group transition-colors')}
                style={{
                  background: isSuspicious ? 'rgba(234,179,8,0.08)' : undefined,
                }}
              >
                {/* Line number */}
                <td
                  className="select-none pl-4 pr-3 text-right w-10"
                  style={{
                    color: isSuspicious ? '#eab308' : 'var(--text-muted)',
                    borderRight: '1px solid var(--border-subtle)',
                    userSelect: 'none',
                    verticalAlign: 'top',
                    paddingTop: 2,
                    paddingBottom: 2,
                    fontSize: 11,
                  }}
                >
                  {lineNum}
                </td>

                {/* Suspicious indicator gutter */}
                <td
                  className="w-4 flex-shrink-0"
                  style={{
                    background: isSuspicious ? 'rgba(234,179,8,0.15)' : 'transparent',
                    borderRight: isSuspicious ? '2px solid #eab308' : '2px solid transparent',
                    width: 6,
                    padding: 0,
                  }}
                />

                {/* Code content */}
                <td
                  className="pl-4 pr-6 whitespace-pre group-hover:bg-white/[0.015]"
                  style={{
                    color: isSuspicious ? '#fde68a' : '#c9d5e8',
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  {isSuspicious && (
                    <span
                      className="mr-2"
                      style={{ color: '#eab308', fontSize: 10 }}
                      title="Suspicious line identified by AI analysis"
                    >
                      ▶
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
