'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { CollegeCard } from '@/components/shared/CollegeCard';
import { InquiryModal } from '@/components/shared/InquiryModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface College {
  id: string;
  name: string;
  mode: string;
  location: string;
  courses_offered: string[];
  logo_url?: string;
}

export function CollegesContent({ colleges, total, online, offline }: { colleges: College[]; total: number; online: number; offline: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [mode, setMode] = useState(searchParams.get('mode') || 'All');
  const [inquireOpen, setInquireOpen] = useState(false);

  const updateFilters = (newSearch: string, newMode: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newMode && newMode !== 'All') params.set('mode', newMode);
    const qs = params.toString();
    router.push(qs ? `/colleges?${qs}` : '/colleges');
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    updateFilters(value, mode);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    updateFilters(search, newMode);
  };

  const clearFilters = () => {
    setSearch('');
    setMode('All');
    router.push('/colleges');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-8">
          <Button variant="primary" size="lg" onClick={() => setInquireOpen(true)}>
            Interested? Get a Free Consultation
          </Button>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-[2rem] p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search colleges or courses..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all"
              />
              {search && (
                <button onClick={clearFilters} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {[
                { label: 'All', count: total },
                { label: 'Online', count: online },
                { label: 'Offline', count: offline },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleModeChange(option.label)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
                    mode === option.label
                      ? option.label === 'All' ? 'bg-slate-900 text-white'
                        : option.label === 'Online' ? 'bg-cyan-500 text-white'
                        : 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {option.label}
                  <span className="ml-1.5 opacity-70">({option.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {colleges.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Colleges Found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
            <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {colleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                onInquire={() => setInquireOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <InquiryModal
        open={inquireOpen}
        onClose={() => setInquireOpen(false)}
        colleges={colleges}
      />
    </>
  );
}
