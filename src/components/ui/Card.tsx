import { cn } from '@/lib/utils/cn';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export function Card({ className, hover = true, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-slate-100 transition-all duration-300',
        glass ? 'bg-white/90 backdrop-blur-2xl border-white shadow-2xl' : 'bg-white/90 backdrop-blur-xl shadow-card',
        hover && 'hover:shadow-card-hover hover:-translate-y-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
