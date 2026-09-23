import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AdminBrand() {
  const [brand, setBrand] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    adminAPI.getBrand().then(r => { setBrand(r.data); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoFile(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      if (logoFile) fd.append('logo', logoFile);
      const fields = ['brandName','phone','email','location','instagram','whatsapp','facebook','youtube','linkedin'];
      fields.forEach(f => fd.append(f, brand[f] || ''));
      await adminAPI.updateBrand(fd);
      toast.success('Brand settings updated successfully');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const u = (field: string, val: string) => setBrand((p: any) => ({ ...p, [field]: val }));

  if (!loaded) return <AdminLayout title="BRAND SETTINGS"><p style={{ color: 'var(--gray)' }}>Loading...</p></AdminLayout>;

  return (
    <AdminLayout title="BRAND SETTINGS">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 40 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20, letterSpacing: '.06em' }}>LOGO</h3>
            <div style={{ width: '100%', aspectRatio: '1', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, padding: 28 }}>
              <img src={preview || brand.logo || '/fort-media-logo.png'} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </div>
            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 8 }} />
            <p style={{ fontSize: 11, color: 'var(--gray-dark)', lineHeight: 1.5 }}>Upload a new logo. It will replace the logo across the entire website.</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20, letterSpacing: '.06em' }}>CONTACT & SOCIAL</h3>
            <div className="admin-form" style={{ maxWidth: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Brand Name</label><input value={brand.brandName || ''} onChange={e => u('brandName', e.target.value)} /></div>
                <div className="form-group"><label>Phone</label><input value={brand.phone || ''} onChange={e => u('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
                <div className="form-group"><label>Email</label><input value={brand.email || ''} onChange={e => u('email', e.target.value)} placeholder="hello@fortmedia.in" /></div>
                <div className="form-group"><label>Location</label><input value={brand.location || ''} onChange={e => u('location', e.target.value)} placeholder="City, India" /></div>
                <div className="form-group"><label>Instagram</label><input value={brand.instagram || ''} onChange={e => u('instagram', e.target.value)} placeholder="@fortmedia" /></div>
                <div className="form-group"><label>WhatsApp</label><input value={brand.whatsapp || ''} onChange={e => u('whatsapp', e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
                <div className="form-group"><label>Facebook</label><input value={brand.facebook || ''} onChange={e => u('facebook', e.target.value)} /></div>
                <div className="form-group"><label>YouTube</label><input value={brand.youtube || ''} onChange={e => u('youtube', e.target.value)} /></div>
                <div className="form-group"><label>LinkedIn</label><input value={brand.linkedin || ''} onChange={e => u('linkedin', e.target.value)} /></div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="submit" disabled={saving} className="admin-btn admin-btn-red">{saving ? 'SAVING...' : 'SAVE BRAND SETTINGS'}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
