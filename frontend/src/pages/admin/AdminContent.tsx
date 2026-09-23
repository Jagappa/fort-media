import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

const SECTIONS = [
  { key: 'hero', label: 'Hero Section', fields: ['heading', 'headingAccent', 'subtext', 'ctaPrimary', 'ctaSecondary', 'showHeroText'] },
  { key: 'about', label: 'About Section', fields: ['heading', 'headingAccent', 'text'] },
  { key: 'whatwedo', label: 'What We Do', fields: ['label', 'heading'] },
  { key: 'quickshoots', label: 'Quick Shoots', fields: ['label', 'heading', 'headingAccent', 'subtext', 'cta'] },
  { key: 'contact', label: 'Contact Section', fields: ['heading', 'headingAccent', 'subtext', 'cta'] },
];

export default function AdminContent() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [active, setActive] = useState('hero');
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminAPI.getContent().then(r => setContent(r.data)).catch(() => {}); }, []);

  const section = SECTIONS.find(s => s.key === active)!;
  const en = content[active]?.en || {};
  const kn = content[active]?.kn || {};

  const update = (langKey: 'en' | 'kn', field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [active]: { ...prev[active], [langKey]: { ...(prev[active]?.[langKey] || {}), [field]: value } },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminAPI.updateContent(active, { content: content[active] });
      toast.success('Content updated successfully');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout title="WEBSITE CONTENT">
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {SECTIONS.map(s => <button key={s.key} onClick={() => setActive(s.key)} className={`admin-btn ${active === s.key ? 'admin-btn-red' : 'admin-btn-outline'}`}>{s.label.toUpperCase()}</button>)}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 28, letterSpacing: '.06em' }}>{section.label}</h3>
        {section.fields.map(field => (
          <div key={field} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>{field.replace(/([A-Z])/g, ' $1').trim()}</div>
            {field === 'showHeroText' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--white)' }}>
                  <input type="checkbox" checked={en[field] !== false && en[field] !== 'false'} onChange={e => update('en', field, String(e.target.checked))} />
                  Show hero text, logo, and buttons (uncheck to show video only)
                </label>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--gray-dark)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>English</label>
                  {field.includes('text') || field.includes('desc') ? (
                    <textarea value={en[field] || ''} onChange={e => update('en', field, e.target.value)} rows={3} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--white)', resize: 'vertical' }} />
                  ) : (
                    <input value={en[field] || ''} onChange={e => update('en', field, e.target.value)} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--white)' }} />
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--gray-dark)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Kannada</label>
                  {field.includes('text') || field.includes('desc') ? (
                    <textarea value={kn[field] || ''} onChange={e => update('kn', field, e.target.value)} rows={3} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--white)', fontFamily: 'var(--font-kannada)', resize: 'vertical' }} />
                  ) : (
                    <input value={kn[field] || ''} onChange={e => update('kn', field, e.target.value)} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--white)', fontFamily: 'var(--font-kannada)' }} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <button onClick={save} disabled={saving} className="admin-btn admin-btn-red">{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
      </div>
    </AdminLayout>
  );
}
