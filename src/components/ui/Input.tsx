'use client';
import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  dark?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, dark, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl text-sm font-semibold transition-all duration-200 outline-none',
            icon ? 'pl-11 pr-4 py-3' : 'px-4 py-3',
            dark
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
              : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
