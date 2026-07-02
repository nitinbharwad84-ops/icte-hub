'use client';
import { Card } from '@/components/ui/Card';
import { MonitorPlay, Briefcase, Award, Atom, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MonitorPlay,
  Briefcase,
  Award,
  Atom,
  Calculator,
};

interface CategoryTileProps {
  abbr: string;
  name: string;
  icon: string;
}

export function CategoryTile({ abbr, name, icon }: CategoryTileProps) {
  const router = useRouter();
  const Icon = iconMap[icon] || MonitorPlay;

  return (
    <button onClick={() => router.push(`/colleges?search=${abbr}`)} className="text-left w-full">
      <Card glass className="p-6 flex flex-col items-center text-center gap-3 cursor-pointer">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className="text-lg font-extrabold text-slate-900">{abbr}</span>
        <span className="text-[11px] font-semibold text-slate-500 leading-tight">{name}</span>
      </Card>
    </button>
  );
}
