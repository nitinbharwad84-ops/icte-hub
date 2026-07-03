'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import { IcteLogo } from '@/components/shared/IcteLogo';

export function TelecallerLayoutClient({ profile, children }: { profile: { name: string; role: string }; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <IcteLogo size={28} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
            Telecaller
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{profile.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
