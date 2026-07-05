'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { User, Mail, Phone, Lock, Save, Upload } from 'lucide-react';
import { compressProfile } from '@/lib/utils/image-compression';
import { ChangePasswordModal } from '@/components/shared/ChangePasswordModal';

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);


  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: profile, error } = await supabase
          .from('users')
          .select('name, email, phone, role, profile_picture_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setName(profile.name || '');
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
          setRole(profile.role || '');
          setProfilePicUrl(profile.profile_picture_url || null);
          setProfilePicPreview(profile.profile_picture_url || null);
        }
        setLoading(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || JSON.stringify(err);
        console.error('Failed to load profile:', msg);
        setError('Failed to load profile');
        setLoading(false);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired. Please login again.');
      setSaving(false);
      return;
    }

    try {
      let newProfilePicUrl: string | null = null;

      if (profilePicFile) {
        const compressed = await compressProfile(profilePicFile);
        const filePath = `${user.id}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('profile_pictures')
          .upload(filePath, compressed, { contentType: 'image/webp', upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(filePath);
        newProfilePicUrl = urlData.publicUrl;
      }

      const updateData: Record<string, unknown> = { name, phone };
      if (newProfilePicUrl) updateData.profile_picture_url = newProfilePicUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw new Error(updateError.message);

      if (newProfilePicUrl) {
        setProfilePicUrl(newProfilePicUrl);
        setProfilePicPreview(newProfilePicUrl);
      }
      setProfilePicFile(null);
      setSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
    setSaving(false);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={32} />
      </div>
    );
  }

  const roleColor = role === 'owner' ? 'purple' as const : role === 'admin' ? 'indigo' as const : 'blue' as const;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Profile Info Card */}
      <Card glass className="!p-6 !rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            {profilePicPreview ? (
              <img src={profilePicPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Upload className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setProfilePicFile(file);
                if (file) {
                  if (profilePicPreview?.startsWith('blob:')) URL.revokeObjectURL(profilePicPreview);
                  setProfilePicPreview(URL.createObjectURL(file));
                }
              }} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500">{email}</span>
              <Badge color={roleColor}>{role}</Badge>
            </div>
          </div>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Email"
              value={email}
              icon={<Mail className="w-4 h-4" />}
              disabled
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Role"
              value={role.charAt(0).toUpperCase() + role.slice(1)}
              icon={<User className="w-4 h-4" />}
              disabled
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card glass className="!p-6 !rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-400" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">Update your password to keep your account secure</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
            <Lock className="w-4 h-4" /> Change Password
          </Button>
        </div>
      </Card>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => setSuccess('Password changed successfully')}
      />
    </div>
  );
}
