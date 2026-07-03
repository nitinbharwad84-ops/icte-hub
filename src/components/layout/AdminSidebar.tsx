'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { createClient } from '@/lib/supabase/client';
import { Users, Building2, GraduationCap, UserCog, DollarSign, Handshake, Flame, LogOut } from 'lucide-react';

const navItems = [
  { icon: Users, label: 'Leads', href: '/admin' },
  { icon: Users, label: 'Institute Leads', href: '/admin/institute-leads' },
  { icon: Building2, label: 'Colleges', href: '/admin/colleges' },
  { icon: GraduationCap, label: 'Institute Courses', href: '/admin/institute-courses' },
  { icon: UserCog, label: 'Team', href: '/admin/team' },
  { icon: DollarSign, label: 'Commissions', href: '/admin/commissions' },
  { icon: Handshake, label: 'Partner Inquiries', href: '/admin/partner-inquiries' },
  { icon: Flame, label: 'Hot Leads', href: '/admin/hot-leads', badge: true },
];

interface AdminSidebarProps {
  user: { name: string; email: string; role: string };
  onClose?: () => void;
}

export function AdminSidebar({ user, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200/80 flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2">
        <IcteLogo size={28} />
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
          {user.role === 'owner' ? 'Owner' : 'Admin'}
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                active ? 'text-brand-blue bg-brand-light' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className="flex-1 text-[10px] font-bold uppercase tracking-wider text-center text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg py-2 transition-all">
            Profile
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-2 transition-all">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
