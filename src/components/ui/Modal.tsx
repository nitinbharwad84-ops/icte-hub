'use client';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import { useEffect, useCallback, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, children, className, size = 'md' }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
      // Focus trap
      const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0]?.focus();
        const handleTab = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        };
        document.addEventListener('keydown', handleTab);
        return () => {
          document.removeEventListener('keydown', handleTab);
          document.removeEventListener('keydown', handleEscape);
          document.body.classList.remove('modal-open');
        };
      }
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={containerRef} className={cn('relative bg-white rounded-[2rem] shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto', sizeClasses[size], className)}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close dialog">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
