'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ChangePasswordModal } from '@/components/shared/ChangePasswordModal';
import { Menu } from 'lucide-react';

interface AdminLayoutClientProps {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <AdminSidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-60">
        <AdminSidebar user={user} />
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-30 md:hidden bg-white border-b border-slate-200 h-16 flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="text-slate-600 p-2">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 text-xs font-extrabold uppercase tracking-widest text-indigo-500">Admin</span>
      </div>

      {/* Content */}
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
