import { cn } from '@/lib/utils/cn';

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-slate-200 rounded-xl', className)} />;
}
