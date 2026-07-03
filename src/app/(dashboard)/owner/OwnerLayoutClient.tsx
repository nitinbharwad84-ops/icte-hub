'use client';
import { useState } from 'react';
import { OwnerSidebar } from '@/components/layout/OwnerSidebar';
import { Menu, X } from 'lucide-react';

interface OwnerLayoutClientProps {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}

export function OwnerLayoutClient({ user, children }: OwnerLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <OwnerSidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-60">
        <OwnerSidebar user={user} />
      </div>

      <div className="sticky top-0 z-30 md:hidden bg-white border-b border-slate-200 h-16 flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)} className="text-slate-600 p-2">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 text-xs font-extrabold uppercase tracking-widest text-indigo-500">Owner</span>
      </div>

      <main className="md:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
