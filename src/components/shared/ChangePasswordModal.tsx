'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful password change */
  onSuccess?: () => void;
}

export function ChangePasswordModal({ open, onClose, onSuccess }: ChangePasswordModalProps) {
  const supabase = createClient();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must differ from current password');
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setError('Session expired. Please login again.');
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      setError('Current password is incorrect');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.from('users').update({ must_change_password: false }).eq('id', user.id);

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      handleClose();
      onSuccess?.();
    }, 1500);
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm">
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Change Password</h2>
          <p className="text-sm text-slate-500 mt-1 text-center">Update your password to keep your account secure</p>
        </div>

        {success ? (
          <Alert variant="success">Password changed successfully!</Alert>
        ) : (
          <>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<KeyRound className="w-4 h-4" />}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<KeyRound className="w-4 h-4" />}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" loading={loading}>
                  <Lock className="w-4 h-4" /> Update
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
