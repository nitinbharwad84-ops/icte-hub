import { createClient } from '@/lib/supabase/server';
import { CollegesContent } from './CollegesContent';

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; mode?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: allColleges } = await supabase.from('colleges').select('*').order('name');

  const total = allColleges?.length || 0;
  const online = allColleges?.filter(c => c.mode === 'Online').length || 0;
  const offline = allColleges?.filter(c => c.mode === 'Offline').length || 0;

  let filtered = allColleges || [];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
  }
  if (params.mode && params.mode !== 'All') {
    filtered = filtered.filter(c => c.mode === params.mode);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-extrabold text-slate-900">Explore Colleges</h1>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Partner Network</span>
        </div>
        <p className="text-slate-600">Find the best partner institutions and courses for your career path.</p>

        <div className="grid grid-cols-3 gap-4 mt-8 mb-8">
          {[
            { label: 'Total Colleges', value: total },
            { label: 'Online Programs', value: online },
            { label: 'Campus Programs', value: offline },
          ].map(stat => (
            <div key={stat.label} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-card p-6 text-center">
              <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <CollegesContent colleges={filtered} total={total} online={online} offline={offline} />
    </div>
  );
}
