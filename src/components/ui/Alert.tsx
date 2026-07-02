import { cn } from '@/lib/utils/cn';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const alertStyles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

const alertIcons = { error: AlertTriangle, success: CheckCircle, warning: AlertTriangle, info: Info };

export function Alert({ variant = 'info', children, className }: AlertProps) {
  const Icon = alertIcons[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm font-medium', alertStyles[variant], className)}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}
