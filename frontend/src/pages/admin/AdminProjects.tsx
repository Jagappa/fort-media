import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Digital Marketing', 'Social Media Management', 'Content Production', 'Ad Films', 'Reels', 'Personal Branding', 'Website Development', 'Car Shoots', 'Bike Shoots', 'House Opening Shoots', 'Product Shoots', 'Business / Store Shoots'];

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleEn: '', titleKn: '', client: '', category: '', descEn: '', descKn: '', displayOrder: 0, isPublished: true, isFeatured: false });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const load = () => adminAPI.getProjects().then(r => setProjects(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (coverFile) fd.append('coverImage', coverFile);
    if (imageFiles) Array.from(imageFiles).forEach(f => fd.append('images', f));
    await adminAPI.createProject(fd);
    toast.success('Project created');
    setShowForm(false);
    load();
  };

  const togglePublish = async (id: string, current: boolean) => {
    const fd = new FormData();
    fd.append('isPublished', String(!current));
    await adminAPI.updateProject(id, fd);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete project?')) return;
    await adminAPI.deleteProject(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout title="PORTFOLIO / PROJECTS">
      <div style={{ marginBottom: 24 }}><button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-red">{showForm ? 'CANCEL' : '+ ADD PROJECT'}</button></div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32, maxWidth: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Title — EN</label><input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} required /></div>
            <div className="form-group"><label>Title — KN</label><input value={form.titleKn} onChange={e => setForm({ ...form, titleKn: e.target.value })} /></div>
            <div className="form-group"><label>Client</label><input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
            <div className="form-group"><label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Description — EN</label><textarea value={form.descEn} onChange={e => setForm({ ...form, descEn: e.target.value })} /></div>
            <div className="form-group"><label>Description — KN</label><textarea value={form.descKn} onChange={e => setForm({ ...form, descKn: e.target.value })} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Cover Image</label><input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--gray)' }} /></div>
            <div className="form-group"><label>Additional Images</label><input type="file" accept="image/*" multiple onChange={e => setImageFiles(e.target.files)} style={{ fontSize: 13, color: 'var(--gray)' }} /></div>
            <div className="form-group"><label>Display Order</label><input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} /></div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} /> Published
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} /> Featured
            </label>
          </div>
          <button type="submit" className="admin-btn admin-btn-red">CREATE PROJECT</button>
        </form>
      )}

      <table className="admin-table">
        <thead><tr><th>Title</th><th>Client</th><th>Category</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
        <tbody>
          {projects.map(p => (
            <tr key={p._id}>
              <td style={{ color: 'var(--white)' }}>{p.title?.en}</td>
              <td>{p.client || '—'}</td>
              <td>{p.category}</td>
              <td><span className={`badge ${p.isPublished ? 'badge-green' : 'badge-yellow'}`}>{p.isPublished ? 'Published' : 'Draft'}</span></td>
              <td>{p.isFeatured ? '★' : '—'}</td>
              <td>
                <div className="admin-actions">
                  <button onClick={() => togglePublish(p._id, p.isPublished)} className="admin-btn admin-btn-outline">{p.isPublished ? 'UNPUBLISH' : 'PUBLISH'}</button>
                  <button onClick={() => remove(p._id)} className="admin-btn admin-btn-danger">DELETE</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
