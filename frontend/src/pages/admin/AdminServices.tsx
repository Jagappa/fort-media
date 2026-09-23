import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

/* A service is now just: two names, an image, and an order.
   The uploaded image is the finished design — the public site renders it
   whole and adds no text of its own — so the names exist purely to identify
   the record here in the CMS.

   Descriptions and the slug field are gone from this form. The slug is
   derived server-side from the English name, because it is still the public
   URL for the service detail page. */

type ServiceForm = { nameEn: string; nameKn: string; displayOrder: number };
const EMPTY: ServiceForm = { nameEn: '', nameKn: '', displayOrder: 0 };

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const load = () => adminAPI.getServices().then(r => setServices(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  // Object URLs must be released or the tab leaks one per file chosen.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    setFile(null);
    setPreview('');
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFile(null);
    setPreview('');
    setShowForm(true);
  };

  const startEdit = (svc: any) => {
    setEditingId(svc._id);
    setForm({
      nameEn: svc.name?.en || '',
      nameKn: svc.name?.kn || '',
      displayOrder: svc.displayOrder || 0,
    });
    setFile(null);
    setPreview(svc.mainImage || '');   // existing image, until a new one is picked
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nameEn = form.nameEn.trim();
    const nameKn = form.nameKn.trim();
    if (!nameEn) { toast.error('English name is required.'); return; }
    if (!nameKn) { toast.error('Kannada name is required.'); return; }
    // On create the image is mandatory; on edit, keeping the current one is fine.
    if (!editingId && !file) { toast.error('Please choose a service image.'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nameEn', nameEn);
      fd.append('nameKn', nameKn);
      fd.append('displayOrder', String(form.displayOrder));
      if (file) fd.append('mainImage', file);

      if (editingId) {
        await adminAPI.updateService(editingId, fd);
        toast.success('Service updated');
      } else {
        await adminAPI.createService(fd);
        toast.success('Service created');
      }
      closeForm();
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const fd = new FormData();
    fd.append('isActive', String(!current));
    await adminAPI.updateService(id, fd);
    toast.success(current ? 'Deactivated' : 'Activated');
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this service and all its videos?')) return;
    await adminAPI.deleteService(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout title="SERVICES">
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => (showForm ? closeForm() : startCreate())} className="admin-btn admin-btn-red">
          {showForm ? 'CANCEL' : '+ ADD SERVICE'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32, maxWidth: '100%' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '.06em', marginBottom: 20 }}>
            {editingId ? 'EDIT SERVICE' : 'NEW SERVICE'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Name — English *</label>
              <input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} required placeholder="Digital Marketing" />
            </div>
            <div className="form-group">
              <label>Name — Kannada *</label>
              <input value={form.nameKn} onChange={e => setForm({ ...form, nameKn: e.target.value })} required placeholder="ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್" style={{ fontFamily: 'var(--font-kannada)' }} />
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginTop: -8, marginBottom: 20, lineHeight: 1.6 }}>
            Both names identify the service here in the admin. Neither is shown on the public
            website — the uploaded image is the entire card.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div className="form-group">
              <label>Service Image {editingId ? '(leave empty to keep current)' : '*'}</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--gray)' }} />
              <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginTop: 8, lineHeight: 1.6 }}>
                Upload the finished design. A square image fits the card exactly.
              </p>
            </div>
            <div className="form-group">
              <label>Preview</label>
              {preview ? (
                <img src={preview} alt="" style={{ width: '100%', maxWidth: 260, aspectRatio: '1 / 1', objectFit: 'cover', border: '1px solid var(--border)' }} />
              ) : (
                <div style={{ width: '100%', maxWidth: 260, aspectRatio: '1 / 1', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--gray-dark)' }}>
                  No image selected
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ maxWidth: 220 }}>
            <label>Display Order</label>
            <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-red">
              {saving ? (editingId ? 'UPDATING...' : 'CREATING...') : (editingId ? 'UPDATE SERVICE' : 'CREATE SERVICE')}
            </button>
            <button type="button" onClick={closeForm} className="admin-btn admin-btn-outline">CANCEL</button>
          </div>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Image</th>
            <th>Name — English</th>
            <th>Name — Kannada</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s._id}>
              <td>{s.displayOrder}</td>
              <td>
                {s.mainImage ? (
                  <img src={s.mainImage} alt="" style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid var(--border)' }} />
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--red)' }}>No image</span>
                )}
              </td>
              <td style={{ color: 'var(--white)' }}>{s.name?.en}</td>
              <td style={{ fontFamily: 'var(--font-kannada)' }}>{s.name?.kn || <span style={{ color: 'var(--red)', fontFamily: 'var(--font-body)', fontSize: 11 }}>Missing</span>}</td>
              <td><span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <div className="admin-actions" style={{ flexWrap: 'wrap' }}>
                  <Link to={`/admin/services/${s._id}`} className="admin-btn admin-btn-outline">MANAGE</Link>
                  <button onClick={() => startEdit(s)} className="admin-btn admin-btn-outline">EDIT</button>
                  <button onClick={() => toggleActive(s._id, s.isActive)} className="admin-btn admin-btn-outline">{s.isActive ? 'DEACTIVATE' : 'ACTIVATE'}</button>
                  <button onClick={() => remove(s._id)} className="admin-btn admin-btn-danger">DELETE</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
