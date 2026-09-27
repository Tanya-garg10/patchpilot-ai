'use client';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      {icon && (
        <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      )}
      <div>
        <div className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{title}</div>
        {description && (
          <div className="text-xs mt-1 max-w-sm" style={{ color: 'var(--text-muted)' }}>{description}</div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
