'use client';
import Link from 'next/link';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { NAV_ITEMS } from '@/lib/utils/constants';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MobileDrawerProps { open: boolean; onClose: () => void; }

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
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
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [open]);

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" />
      <div ref={drawerRef} className="fixed top-0 left-0 z-50 w-72 h-full bg-white border-r border-slate-200/80 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <IcteLogo size={28} />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close navigation menu"><X className="w-6 h-6" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} href={item.href}
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-3 rounded-lg transition-all"
              onClick={onClose}>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Link href="/login" onClick={onClose}><Button variant="primary" className="w-full">Login</Button></Link>
        </div>
      </div>
    </>
  );
}
