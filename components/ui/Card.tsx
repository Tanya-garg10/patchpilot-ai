'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
  accentColor?: string;
}

export function Card({ children, className, elevated, onClick, accentColor }: CardProps) {
  return (
    <div
      className={cn(
        elevated ? 'surface-elevated' : 'surface',
        onClick && 'cursor-pointer transition-all duration-150 hover:border-[#243552]',
        className
      )}
      style={accentColor ? { borderTop: `1.5px solid ${accentColor}` } : undefined}
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
    <div
      className={cn('flex items-center justify-between gap-3 px-4 py-3', className)}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <div className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-xs" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 10.5, marginTop: 1, color: 'var(--text-muted)' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
