'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { Button } from '@/components/ui/Button';
import { Menu } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <IcteLogo size={32} />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {['Universities', 'Courses', 'Programs'].map((item) => (
              <Link key={item} href={item === 'Universities' ? '/colleges' : '#'}
                className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all">
                {item}
              </Link>
            ))}
            <Link href="/login"><Button variant="primary" size="sm">Login</Button></Link>
          </nav>
          <button onClick={() => setDrawerOpen(true)} className="md:hidden text-slate-600 p-2" aria-label="Open navigation menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
