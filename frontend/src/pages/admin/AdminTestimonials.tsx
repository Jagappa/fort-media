import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AdminTestimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientName: '', company: '', testimonialEn: '', testimonialKn: '', rating: 5 });
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminAPI.getTestimonials().then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.testimonialEn) { toast.error('Please fill client name and testimonial.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imgFile) fd.append('profileImage', imgFile);
      await adminAPI.createTestimonial(fd);
      toast.success('Testimonial added successfully');
      setShowForm(false);
      setForm({ clientName: '', company: '', testimonialEn: '', testimonialKn: '', rating: 5 });
      setImgFile(null);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(!current));
      await adminAPI.updateTestimonial(id, fd);
      toast.success(current ? 'Hidden' : 'Activated');
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try { await adminAPI.deleteTestimonial(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="TESTIMONIALS">
      <div style={{ marginBottom: 24 }}><button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-red">{showForm ? 'CANCEL' : '+ ADD TESTIMONIAL'}</button></div>
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32, maxWidth: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Client Name</label><input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required placeholder="Client name" /></div>
            <div className="form-group"><label>Company Name</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company (optional)" /></div>
            <div className="form-group"><label>Testimonial / Review — English</label><textarea value={form.testimonialEn} onChange={e => setForm({ ...form, testimonialEn: e.target.value })} required placeholder="What the client said..." /></div>
            <div className="form-group"><label>Testimonial — Kannada (optional)</label><textarea value={form.testimonialKn} onChange={e => setForm({ ...form, testimonialKn: e.target.value })} style={{ fontFamily: 'var(--font-kannada)' }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Rating (1–5 stars)</label><input type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} style={{ width: 100 }} /></div>
            <div className="form-group"><label>Client Photo (optional)</label><input type="file" accept="image/*" onChange={e => setImgFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--gray)' }} /></div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-red">{saving ? 'SAVING...' : 'SAVE'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline">CANCEL</button>
          </div>
        </form>
      )}
      <table className="admin-table">
        <thead><tr><th>Client</th><th>Company</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(t => (
            <tr key={t._id}>
              <td style={{ color: 'var(--white)' }}>{t.clientName}</td>
              <td>{t.company || '—'}</td>
              <td style={{ color: '#eab308' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</td>
              <td><span className={`badge ${t.isActive ? 'badge-green' : 'badge-red'}`}>{t.isActive ? 'Active' : 'Hidden'}</span></td>
              <td><div className="admin-actions">
                <button onClick={() => toggleActive(t._id, t.isActive)} className="admin-btn admin-btn-outline">{t.isActive ? 'HIDE' : 'SHOW'}</button>
                <button onClick={() => remove(t._id)} className="admin-btn admin-btn-danger">DELETE</button>
              </div></td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No testimonials yet. Click "+ ADD TESTIMONIAL" above.</td></tr>}
        </tbody>
      </table>
    </AdminLayout>
  );
}
