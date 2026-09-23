import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

const statusBadge = (s: string) => ({ pending: 'badge-yellow', verified: 'badge-green', rejected: 'badge-red' }[s] || 'badge-gray');

export default function AdminPartners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', business: '', phone: '', email: '', password: '', partnerType: 'general', notes: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminAPI.getPartners().then(r => setPartners(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Please enter partner name.'); return; }
    if (!form.email) { toast.error('Please enter partner email.'); return; }
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setSaving(true);
    try {
      // Create login account
      await adminAPI.createPartnerAccount({ name: form.name, email: form.email, password: form.password });
      // Create project partner entry
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('business', form.business);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('partnerType', form.partnerType);
      fd.append('notes', form.notes);
      if (logoFile) fd.append('logo', logoFile);
      await adminAPI.createPartner(fd);
      toast.success(`Partner created!\nLogin: ${form.email} / ${form.password}`);
      setShowForm(false);
      setForm({ name: '', business: '', phone: '', email: '', password: '', partnerType: 'general', notes: '' });
      setLogoFile(null);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create partner'); }
    finally { setSaving(false); }
  };

  const updatePartner = async (id: string, data: Record<string, string>) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      await adminAPI.updatePartner(id, fd);
      toast.success('Updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    try { await adminAPI.deletePartner(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="PROJECT PARTNERS">
      <div style={{ marginBottom: 24 }}><button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-red">{showForm ? 'CANCEL' : '+ ADD PARTNER'}</button></div>
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32, maxWidth: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Partner Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Full name" /></div>
            <div className="form-group"><label>Business / Company</label><input value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} placeholder="Company name" /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
            <div className="form-group"><label>Email (Login Email)</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="partner@email.com" /></div>
            <div className="form-group">
              <label>Password (Login Password)</label>
              <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 characters" />
              <span style={{ fontSize: 11, color: 'var(--gray-dark)', marginTop: 4, display: 'block' }}>Partner will use this email & password to login at /admin/login</span>
            </div>
            <div className="form-group"><label>Partner Type</label><input value={form.partnerType} onChange={e => setForm({ ...form, partnerType: e.target.value })} placeholder="general" /></div>
          </div>
          <div className="form-group"><label>Logo / Image (optional)</label><input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--gray)' }} /></div>
          <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-red">{saving ? 'CREATING...' : 'CREATE PARTNER'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline">CANCEL</button>
          </div>
        </form>
      )}
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Business</th><th>Email</th><th>Verification</th><th>Active</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {partners.map(p => (
            <tr key={p._id}>
              <td style={{ color: 'var(--white)' }}>{p.name}</td>
              <td>{p.business || '—'}</td>
              <td>{p.email || '—'}</td>
              <td><span className={`badge ${statusBadge(p.verificationStatus)}`}>{p.verificationStatus}</span></td>
              <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Yes' : 'No'}</span></td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td><div className="admin-actions" style={{ flexWrap: 'wrap' }}>
                {p.verificationStatus !== 'verified' && <button onClick={() => updatePartner(p._id, { verificationStatus: 'verified' })} className="admin-btn admin-btn-outline">VERIFY</button>}
                {p.verificationStatus !== 'rejected' && <button onClick={() => updatePartner(p._id, { verificationStatus: 'rejected' })} className="admin-btn admin-btn-outline">REJECT</button>}
                <button onClick={() => updatePartner(p._id, { isActive: String(!p.isActive) })} className="admin-btn admin-btn-outline">{p.isActive ? 'DEACTIVATE' : 'ACTIVATE'}</button>
                <button onClick={() => remove(p._id)} className="admin-btn admin-btn-danger">DELETE</button>
              </div></td>
            </tr>
          ))}
          {!partners.length && <tr><td colSpan={7} style={{ textAlign: 'center' }}>No partners yet. Click "+ ADD PARTNER" above.</td></tr>}
        </tbody>
      </table>
    </AdminLayout>
  );
}
