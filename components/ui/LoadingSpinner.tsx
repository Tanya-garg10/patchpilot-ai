'use client';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export function LoadingSpinner({ size = 24, message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className="animate-spin rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--border)',
          borderTopColor: 'var(--accent)',
        }}
      />
      {message && (
        <p className="text-xs animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export function InlineSpinner({ size = 14 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 inline-block"
      style={{
        width: size,
        height: size,
        borderColor: 'var(--border)',
        borderTopColor: 'var(--accent)',
      }}
    />
  );
}
