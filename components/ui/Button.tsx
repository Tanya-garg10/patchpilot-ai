'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00d4ff]/40 disabled:opacity-40 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-sm',
      secondary:
        'bg-transparent border border-[#1a2540] hover:border-[#243552] hover:bg-white/[0.03] text-[#e2eaf5]',
      ghost:
        'bg-transparent hover:bg-white/[0.04] text-[#7e93b0] hover:text-[#e2eaf5]',
      danger:
        'bg-transparent border border-[#1a2540] hover:bg-red-500/10 hover:border-red-500/30 text-[#ef4444]',
      success:
        'bg-transparent border border-[#1a2540] hover:bg-green-500/10 hover:border-green-500/30 text-[#22c55e]',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3.5 py-2 text-xs',
      lg: 'px-4 py-2.5 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
