import { createClient } from '@/lib/supabase/server';
import { CollegesContent } from './CollegesContent';

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; mode?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const search = params.search || '';
  const mode = params.mode || '';
  let query = supabase.from('colleges').select('id, name, mode, location, logo_url, courses_offered');
  if (search) query = query.ilike('name', `%${search}%`);
  if (mode && mode !== 'All') query = query.eq('mode', mode);
  query = query.order('name');
  const { data: colleges } = await query;

  const total = colleges?.length || 0;
  const online = colleges?.filter(c => c.mode === 'Online').length || 0;
  const offline = colleges?.filter(c => c.mode === 'Offline').length || 0;

  const filtered = colleges || [];

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
