'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils/formatters';
import { createTelecallerAction, getTelecallersAction } from '@/lib/actions/team';
import { toggleUserActiveAction } from '@/lib/actions/auth';
import { UserPlus, UserCog, Phone, Mail, Clock, Shield, Activity, Key } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Telecaller {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  leads_count: number;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function AdminTeamPage() {
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTelecallers = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getTelecallersAction();
    if (result.success) {
      setTelecallers(result.data);
    } else {
      setError(result.error ?? 'An error occurred');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTelecallers();
  }, [fetchTelecallers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    const result = await createTelecallerAction(formName, formEmail, formPhone);
    if (result.success) {
      setTempPassword(result.tempPassword!);
      setSuccess(`Telecaller "${formName}" created successfully!`);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      fetchTelecallers();
    } else {
      setFormError(result.error || '');
    }
    setCreating(false);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setTogglingId(id);
    setError('');
    const result = await toggleUserActiveAction(id, !current);
    if (result.success) {
      setTelecallers(prev =>
        prev.map(t => t.id === id ? { ...t, is_active: !current } : t)
      );
    } else {
      setError(result.error || '');
    }
    setTogglingId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTempPassword('');
    setFormError('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Team Management</h1>
          <p className="text-sm text-slate-500 mt-1">{telecallers.length} telecallers</p>
        </div>
        <Button variant="dark" onClick={() => setShowModal(true)}>
          <UserPlus className="w-4 h-4" /> Add Telecaller
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : telecallers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No telecallers found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Email</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Phone</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Leads</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Last Login</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Created</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {telecallers.map((tc) => (
                  <tr key={tc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                          {tc.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{tc.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{tc.email}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {tc.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full',
                        tc.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      )}>
                        <Activity className="w-3 h-3" />
                        {tc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <UserCog className="w-3.5 h-3.5 text-slate-400" />
                        {tc.leads_count}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {tc.last_sign_in_at ? formatDate(tc.last_sign_in_at) : 'Never'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{formatDate(tc.created_at)}</td>
                    <td className="p-4">
                      <Button
                        variant={tc.is_active ? 'danger' : 'ghost'}
                        size="sm"
                        loading={togglingId === tc.id}
                        onClick={() => handleToggleActive(tc.id, tc.is_active)}
                      >
                        {tc.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showModal} onClose={handleCloseModal}>
        <div className="p-6">
          {tempPassword ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Key className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-2">Telecaller Created!</h2>
              <p className="text-sm text-slate-500 mb-4">
                The telecaller can sign in with the temporary password below.
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Temporary Password</p>
                <p className="text-lg font-mono font-bold text-slate-900">{tempPassword}</p>
              </div>
              <Button variant="dark" onClick={handleCloseModal}>Done</Button>
            </div>
          ) : (
            <form onSubmit={handleCreate}>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Add Telecaller</h2>
              <p className="text-sm text-slate-500 mb-6">Create a new telecaller account</p>

              {formError && <Alert variant="error" className="mb-4">{formError}</Alert>}

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button type="submit" variant="dark" loading={creating} className="flex-1">
                  <UserPlus className="w-4 h-4" /> Create Telecaller
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
