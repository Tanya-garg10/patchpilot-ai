'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, elevated, onClick }: CardProps) {
  return (
    <div
      className={cn(
        elevated ? 'surface-elevated' : 'surface',
        onClick && 'cursor-pointer hover:border-[#3a4a5e] transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, actions, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-4', className)} style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{title}</div>
          {subtitle && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
