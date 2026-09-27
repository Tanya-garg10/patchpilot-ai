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
      'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-[#3b82d4] hover:bg-[#2d6bb8] text-white',
      secondary: 'bg-transparent border border-[#2a3547] hover:bg-white/5 text-[#e8edf3]',
      ghost: 'bg-transparent hover:bg-white/5 text-[#8b97a8] hover:text-[#e8edf3]',
      danger: 'bg-transparent border border-[#2a3547] hover:bg-red-500/10 hover:border-red-500/50 text-[#ef4444]',
      success: 'bg-transparent border border-[#2a3547] hover:bg-green-500/10 hover:border-green-500/50 text-[#22c55e]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
