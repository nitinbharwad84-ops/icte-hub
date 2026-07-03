import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  variant?: 'status' | 'mode' | 'default';
  color?: 'blue' | 'indigo' | 'purple' | 'slate' | 'emerald' | 'teal' | 'cyan' | 'orange' | 'amber' | 'red';
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<string, string> = {
  blue: 'text-blue-700 bg-blue-50 border-blue-200',
  indigo: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  purple: 'text-purple-700 bg-purple-50 border-purple-200',
  slate: 'text-slate-500 bg-slate-50 border-slate-200',
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  teal: 'text-teal-700 bg-teal-50 border-teal-200',
  cyan: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  orange: 'text-orange-700 bg-orange-50 border-orange-200',
  amber: 'text-amber-700 bg-amber-50 border-amber-200',
  red: 'text-red-700 bg-red-50 border-red-200',
};

export function Badge({ color = 'slate', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border',
      colorMap[color], className
    )}>
      {children}
    </span>
  );
}
