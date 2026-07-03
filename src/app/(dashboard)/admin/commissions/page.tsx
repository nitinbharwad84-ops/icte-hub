'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { CheckCircle, DollarSign, Clock, BarChart3 } from 'lucide-react';

interface Commission {
  id: string;
  lead_id: string;
  college_id: string;
  amount: number | null;
  status: 'pending' | 'received';
  created_at: string;
  lead?: { id: string; name: string; assigned_telecaller_id: string | null };
  college?: { id: string; name: string; commission_percent: number | null; commission_structure: string | null };
}

interface Telecaller {
  id: string;
  name: string;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [telecallerFilter, setTelecallerFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data: telecallersData } = await supabase
      .from('users')
      .select('id, name');

    let query = supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data: commissionsData, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setLoading(false); return; }

    const leadIds = [...new Set(commissionsData?.map(c => c.lead_id) || [])];
    const collegeIds = [...new Set(commissionsData?.map(c => c.college_id) || [])];

    const [leadsResult, collegesResult] = await Promise.all([
      supabase.from('leads').select('id, name, assigned_telecaller_id').in('id', leadIds.length > 0 ? leadIds : ['no-op']),
      supabase.from('colleges').select('id, name, commission_percent, commission_structure').in('id', collegeIds.length > 0 ? collegeIds : ['no-op']),
    ]);

    const leadMap = new Map(leadsResult.data?.map(l => [l.id, l]) || []);
    const collegeMap = new Map(collegesResult.data?.map(c => [c.id, c]) || []);

    const enriched = (commissionsData || [])
      .map(c => ({
        ...c,
        lead: leadMap.get(c.lead_id),
        college: collegeMap.get(c.college_id),
      }))
      .filter(c => {
        if (telecallerFilter) {
          return c.lead?.assigned_telecaller_id === telecallerFilter;
        }
        return true;
      });

    setCommissions(enriched);
    setTelecallers(telecallersData ?? []);
    setLoading(false);
  }, [statusFilter, telecallerFilter, supabase]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const handleMarkAsPaid = async (commissionId: string) => {
    setUpdatingId(commissionId);
    const { error: updateError } = await supabase
      .from('commissions')
      .update({ status: 'received' })
      .eq('id', commissionId);
    if (!updateError) {
      fetchCommissions();
    } else {
      setError(updateError.message);
    }
    setUpdatingId(null);
  };

  const pendingTotal = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const paidTotal = commissions
    .filter(c => c.status === 'received')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const telecallerMap = new Map(telecallers.map(t => [t.id, t.name]));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Commissions Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">{commissions.length} total commissions</p>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pending</p>
              <p className="text-xl font-extrabold text-slate-900">{formatCurrency(pendingTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {commissions.filter(c => c.status === 'pending').length} pending commission{commissions.filter(c => c.status === 'pending').length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Paid</p>
              <p className="text-xl font-extrabold text-slate-900">{formatCurrency(paidTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {commissions.filter(c => c.status === 'received').length} paid commission{commissions.filter(c => c.status === 'received').length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total</p>
              <p className="text-xl font-extrabold text-slate-900">{formatCurrency(pendingTotal + paidTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">{commissions.length} total commission{commissions.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'received', label: 'Paid' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            options={[
              { value: '', label: 'All Telecallers' },
              ...telecallers.map(t => ({ value: t.id, label: t.name })),
            ]}
            value={telecallerFilter}
            onChange={(e) => setTelecallerFilter(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => { setStatusFilter(''); setTelecallerFilter(''); }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : commissions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No commissions found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Lead</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">College</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Amount</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Type</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Telecaller</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Date</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => {
                  const telecallerId = commission.lead?.assigned_telecaller_id;
                  const telecallerName = telecallerId ? telecallerMap.get(telecallerId) || 'Unknown' : 'Unassigned';
                  const amount = commission.amount ?? commission.college?.commission_percent;
                  const amountDisplay = amount != null ? formatCurrency(amount) : '—';
                  const commissionType = commission.college?.commission_structure
                    ? commission.college.commission_structure === 'one-time' ? 'One-time' : 'Installments'
                    : '—';

                  return (
                    <tr key={commission.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">
                        {commission.lead?.name || 'Unknown'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {commission.college?.name || 'Unknown'}
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {amountDisplay}
                      </td>
                      <td className="p-4 text-slate-600">
                        {commissionType}
                      </td>
                      <td className="p-4 text-slate-600">
                        {telecallerName}
                      </td>
                      <td className="p-4">
                        <Badge
                          color={commission.status === 'received' ? 'emerald' : 'orange'}
                        >
                          {commission.status === 'received' ? 'Paid' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {formatDate(commission.created_at)}
                      </td>
                      <td className="p-4">
                        {commission.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="dark"
                            loading={updatingId === commission.id}
                            onClick={() => handleMarkAsPaid(commission.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark as Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
