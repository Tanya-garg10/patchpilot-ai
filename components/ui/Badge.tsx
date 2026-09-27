'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'cyan' | 'orange' | 'purple' | 'gray';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn('tag', `tag-${variant}`, className)}>
      {children}
    </span>
  );
}

interface StatusDotProps {
  color: 'green' | 'yellow' | 'red' | 'blue' | 'cyan' | 'orange' | 'gray';
  className?: string;
}

const dotColors = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  blue: '#3b82d4',
  cyan: '#06b6d4',
  orange: '#f97316',
  gray: '#8b97a8',
};

export function StatusDot({ color, className }: StatusDotProps) {
  return (
    <span
      className={cn('inline-block rounded-full flex-shrink-0', className)}
      style={{ width: 6, height: 6, background: dotColors[color] }}
    />
  );
}
