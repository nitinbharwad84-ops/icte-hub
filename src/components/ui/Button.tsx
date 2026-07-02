'use client';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40',
  secondary: 'bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white',
  dark: 'bg-slate-900 hover:bg-brand-blue text-white',
  danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
  ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs cursor-pointer transition-all duration-200',
        size === 'sm' && 'px-3 py-1.5 rounded-lg',
        size === 'md' && 'px-5 py-2.5 rounded-xl',
        size === 'lg' && 'px-6 py-3 rounded-xl',
        variants[variant],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
