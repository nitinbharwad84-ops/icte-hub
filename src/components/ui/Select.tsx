'use client';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={props.id}
          className={cn(
            'w-full appearance-none rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold px-4 py-3 pr-10 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all',
            error && 'border-red-500', className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
