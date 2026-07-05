'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TelecallerSidebar } from '@/components/layout/TelecallerSidebar';
import { ChangePasswordModal } from '@/components/shared/ChangePasswordModal';
import { Menu } from 'lucide-react';

interface TelecallerLayoutClientProps {
  profile: { name: string; email: string; role: string };
  children: React.ReactNode;
}

export function TelecallerLayoutClient({ profile, children }: TelecallerLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('change_password') === 'true') {
      setShowPasswordModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <TelecallerSidebar user={profile} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-60">
        <TelecallerSidebar user={profile} />
      </div>

      <div className="sticky top-0 z-30 md:hidden bg-white border-b border-slate-200 h-16 flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="text-slate-600 p-2">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 text-xs font-extrabold uppercase tracking-widest text-emerald-500">Telecaller</span>
      </div>

      <main className="md:ml-60 min-h-screen">
        {children}
      </main>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
