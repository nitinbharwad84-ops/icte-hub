'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { compressLogo } from '@/lib/utils/image-compression';

interface College {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  type: string | null;
  established_year: number | null;
  website: string | null;
  description: string | null;
  status: string;
  logo_url?: string | null;
  created_at: string;
}

const defaultForm = {
  name: '', city: '', state: '', type: 'college',
  established_year: '', website: '', description: '', status: 'active',
};

type FormData = typeof defaultForm;

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const supabase = createClient();

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('colleges')
      .select('*')
      .order('name');
    if (fetchError) { setError(fetchError.message); setLoading(false); return; }
    setColleges(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(defaultForm);
    setLogoFile(null);
    setLogoPreview(null);
    setModalOpen(true);
  };

  const openEditModal = (college: College) => {
    setEditingId(college.id);
    setForm({
      name: college.name,
      city: college.city || '',
      state: college.state || '',
      type: college.type || 'college',
      established_year: college.established_year?.toString() || '',
      website: college.website || '',
      description: college.description || '',
      status: college.status,
    });
    setLogoFile(null);
    setLogoPreview(college.logo_url || null);
    setModalOpen(true);
  };

  const handleSelectLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('College name is required'); return; }
    if (form.website && !/^https?:\/\//.test(form.website)) { setError('Website must start with http:// or https://'); return; }
    setSaving(true);
    setError('');

    try {
      let logoUrl: string | null = null;

      if (logoFile) {
        const compressed = await compressLogo(logoFile);
        const filePath = `${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('college_logos')
          .upload(filePath, compressed, { contentType: 'image/webp', upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: urlData } = supabase.storage.from('college_logos').getPublicUrl(filePath);
        logoUrl = urlData.publicUrl;
      }

      const payload: Record<string, unknown> = {
        name: form.name,
        city: form.city || null,
        state: form.state || null,
        type: form.type || null,
        established_year: form.established_year ? parseInt(form.established_year, 10) : null,
        website: form.website || null,
        description: form.description || null,
        status: form.status,
      };
      if (logoUrl) payload.logo_url = logoUrl;

      if (editingId) {
        const { error: updateError } = await supabase.from('colleges').update(payload).eq('id', editingId);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase.from('colleges').insert(payload);
        if (insertError) throw new Error(insertError.message);
      }

      setSaving(false);
      setModalOpen(false);
      fetchColleges();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save college');
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error: deleteError } = await supabase.from('colleges').delete().eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    setDeleteConfirm(null);
    fetchColleges();
  };

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">College Management</h1>
          <p className="text-sm text-slate-500 mt-1">{colleges.length} total colleges</p>
        </div>
        <Button variant="dark" onClick={openAddModal}>
          <Plus className="w-4 h-4" /> Add College
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text" placeholder="Search by name or city..." aria-label="Search colleges"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-brand-blue/50"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : filteredColleges.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No colleges found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Logo</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">City</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Type</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Est. Year</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Website</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredColleges.map((college) => (
                  <tr key={college.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      {college.logo_url ? (
                        <img src={college.logo_url} alt={college.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">—</div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{college.name}</td>
                    <td className="p-4 text-slate-600">{college.city || '—'}</td>
                    <td className="p-4">
                      <Badge color={college.type === 'university' ? 'purple' : college.type === 'institute' ? 'teal' : 'blue'}>
                        {college.type || '—'}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600">{college.established_year || '—'}</td>
                    <td className="p-4">
                      {college.website ? (
                        <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs">
                          {college.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="p-4">
                      <Badge color={college.status === 'active' ? 'emerald' : 'slate'}>
                        {college.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(college)} className="text-slate-400 hover:text-indigo-500 transition-colors" title="Edit" aria-label="Edit college">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(college.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete" aria-label="Delete college">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-2xl">
        <div className="p-8">
          <h2 className="text-lg font-extrabold text-slate-900 mb-6">{editingId ? 'Edit College' : 'Add College'}</h2>
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="College name" />
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">College Logo</label>
              <div className="flex items-center gap-3">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer hover:border-brand-blue/50 hover:text-brand-blue transition-all">
                  <Upload className="w-4 h-4" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleSelectLogo} className="hidden" />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
              <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                options={[
                  { value: 'college', label: 'College' },
                  { value: 'university', label: 'University' },
                  { value: 'institute', label: 'Institute' },
                ]}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
              <Input label="Established Year" type="number" value={form.established_year} onChange={(e) => setForm({ ...form, established_year: e.target.value })} placeholder="e.g. 1995" />
            </div>
            <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
            <div className="w-full">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="College description..."
                rows={3}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold px-4 py-3 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all resize-none"
              />
            </div>
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="dark" onClick={handleSave} loading={saving}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="p-8 text-center">
          <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Delete College?</h2>
          <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm!)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
