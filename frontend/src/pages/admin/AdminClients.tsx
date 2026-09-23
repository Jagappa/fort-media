import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AdminClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', website: '', displayOrder: 0 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminAPI.getClients().then(r => setClients(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Please enter client name.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('website', form.website);
      fd.append('displayOrder', String(form.displayOrder));
      if (logoFile) fd.append('logo', logoFile);
      await adminAPI.createClient(fd);
      toast.success('Client added successfully');
      setShowForm(false);
      setForm({ name: '', website: '', displayOrder: 0 });
      setLogoFile(null);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(!current));
      await adminAPI.updateClient(id, fd);
      toast.success(current ? 'Client hidden' : 'Client activated');
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try { await adminAPI.deleteClient(id); toast.success('Client deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="CLIENTS">
      <div style={{ marginBottom: 24 }}><button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-red">{showForm ? 'CANCEL' : '+ ADD CLIENT'}</button></div>
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32 }}>
          <div className="form-group"><label>Client Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Enter client name" /></div>
          <div className="form-group"><label>Website (optional)</label><input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></div>
          <div className="form-group"><label>Client Logo / Image</label><input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--gray)' }} /></div>
          <div className="form-group"><label>Display Order</label><input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} style={{ width: 120 }} /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-red">{saving ? 'SAVING...' : 'SAVE'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline">CANCEL</button>
          </div>
        </form>
      )}
      <table className="admin-table">
        <thead><tr><th>Logo</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {clients.map(c => (
            <tr key={c._id}>
              <td>{c.logo ? <img src={c.logo} style={{ height: 36, maxWidth: 80, objectFit: 'contain' }} alt="" /> : <span style={{ color: 'var(--gray-dark)' }}>No logo</span>}</td>
              <td style={{ color: 'var(--white)' }}>{c.name}</td>
              <td><span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>{c.isActive ? 'Active' : 'Hidden'}</span></td>
              <td><div className="admin-actions">
                <button onClick={() => toggleActive(c._id, c.isActive)} className="admin-btn admin-btn-outline">{c.isActive ? 'HIDE' : 'SHOW'}</button>
                <button onClick={() => remove(c._id)} className="admin-btn admin-btn-danger">DELETE</button>
              </div></td>
            </tr>
          ))}
          {!clients.length && <tr><td colSpan={4} style={{ textAlign: 'center' }}>No clients yet. Click "+ ADD CLIENT" above.</td></tr>}
        </tbody>
      </table>
    </AdminLayout>
  );
}
