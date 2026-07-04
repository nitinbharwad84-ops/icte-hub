'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils/formatters';
import { getAdminsAction, createAdminAction, toggleAdminActiveAction, resetAdminPasswordAction, deleteAdminAction } from '@/lib/actions/owner';
import { UserPlus, Shield, Clock, Activity, Key, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Admin {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function OwnerAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getAdminsAction();
    if (result.success) {
      setAdmins(result.data);
    } else {
      setError(result.error ?? 'An error occurred');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim()) { setFormError('Name is required'); return; }
    if (!formEmail.trim() || !formEmail.includes('@')) { setFormError('Valid email is required'); return; }
    setCreating(true);
    const result = await createAdminAction(formName, formEmail, formPassword);
    if (result.success) {
      setTempPassword(result.tempPassword!);
      setSuccess(`Admin "${formName}" created successfully!`);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      fetchAdmins();
    } else {
      setFormError(result.error || '');
    }
    setCreating(false);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const action = current ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this admin?`)) return;
    setTogglingId(id);
    setError('');
    const result = await toggleAdminActiveAction(id, !current);
    if (result.success) {
      setAdmins(prev =>
        prev.map(a => a.id === id ? { ...a, is_active: !current } : a)
      );
    } else {
      setError(result.error || '');
    }
    setTogglingId(null);
  };

  const handleResetPassword = async (id: string) => {
    setResettingId(id);
    setError('');
    setResetPasswordResult('');
    const result = await resetAdminPasswordAction(id);
    if (result.success) {
      setResetPasswordResult(result.tempPassword!);
      setSuccess('Password reset successfully!');
    } else {
      setError(result.error || '');
    }
    setResettingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError('');
    const result = await deleteAdminAction(id);
    if (result.success) {
      setSuccess('Admin deleted successfully!');
      setConfirmDelete(null);
      fetchAdmins();
    } else {
      setError(result.error || '');
    }
    setDeletingId(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setTempPassword('');
    setFormError('');
    setFormName('');
    setFormEmail('');
    setFormPassword('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Management</h1>
          <p className="text-sm text-slate-500 mt-1">{admins.length} admins</p>
        </div>
        <Button variant="dark" onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-4 h-4" /> Add Admin
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : admins.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No admins found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Email</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Last Login</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Created</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{admin.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{admin.email}</td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full',
                        admin.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      )}>
                        <Activity className="w-3 h-3" />
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {admin.last_sign_in_at ? formatDate(admin.last_sign_in_at) : 'Never'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{formatDate(admin.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={admin.is_active ? 'danger' : 'ghost'}
                          size="sm"
                          loading={togglingId === admin.id}
                          onClick={() => handleToggleActive(admin.id, admin.is_active)}
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={resettingId === admin.id}
                          onClick={() => handleResetPassword(admin.id)}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </Button>
                        {confirmDelete === admin.id ? (
                          <div className="flex items-center gap-1">
                            <Button variant="danger" size="sm" loading={deletingId === admin.id} onClick={() => handleDelete(admin.id)}>
                              Confirm
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(admin.id)} aria-label="Delete admin">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </td>
                    {resetPasswordResult && resettingId === null && (
                      <Modal open={true} onClose={() => setResetPasswordResult('')}>
                        <div className="p-6 text-center">
                          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                            <Key className="w-7 h-7 text-emerald-500" />
                          </div>
                          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Password Reset</h2>
                          <p className="text-sm text-slate-500 mb-4">
                            The admin can sign in with the temporary password below.
                          </p>
                          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Temporary Password</p>
                            <p className="text-lg font-mono font-bold text-slate-900">{resetPasswordResult}</p>
                          </div>
                          <Button variant="dark" onClick={() => setResetPasswordResult('')}>Done</Button>
                        </div>
                      </Modal>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showAddModal} onClose={handleCloseAddModal}>
        <div className="p-6">
          {tempPassword ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Key className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-2">Admin Created!</h2>
              <p className="text-sm text-slate-500 mb-4">
                The admin can sign in with the password you entered.
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Password</p>
                <p className="text-lg font-mono font-bold text-slate-900">{tempPassword}</p>
              </div>
              <Button variant="dark" onClick={handleCloseAddModal}>Done</Button>
            </div>
          ) : (
            <form onSubmit={handleCreate}>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Add Admin</h2>
              <p className="text-sm text-slate-500 mb-6">Create a new admin account</p>

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
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button type="submit" variant="dark" loading={creating} className="flex-1">
                  <UserPlus className="w-4 h-4" /> Create Admin
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseAddModal}>
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
