import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI, mediaUrl } from '../../api';
import toast from 'react-hot-toast';

export default function AdminQuickShoots() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nameEn: '', nameKn: '', descEn: '', descKn: '', displayOrder: 0 });
  const [saving, setSaving] = useState(false);
  // Video management
  const [manageId, setManageId] = useState<string | null>(null);
  const [manageName, setManageName] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSaving, setVideoSaving] = useState(false);

  const load = () => adminAPI.getQuickShoots().then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const loadVideos = (qsId: string) => {
    adminAPI.getQuickShootVideos(qsId).then(r => setVideos(r.data)).catch(() => {});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      await adminAPI.createQuickShoot(fd);
      toast.success('Quick Shoot type added');
      setShowForm(false);
      setForm({ nameEn: '', nameKn: '', descEn: '', descKn: '', displayOrder: 0 });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(!current));
      await adminAPI.updateQuickShoot(id, fd);
      toast.success(current ? 'Hidden' : 'Activated');
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this quick shoot type and all its videos?')) return;
    try { await adminAPI.deleteQuickShoot(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const openManage = (qs: any) => {
    setManageId(qs._id);
    setManageName(qs.name?.en || '');
    loadVideos(qs._id);
  };

  const addVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoFile || !manageId) { toast.error('Please select a video file.'); return; }
    setVideoSaving(true);
    try {
      const fd = new FormData();
      fd.append('video', videoFile);
      fd.append('title', videoTitle || videoFile.name);
      await adminAPI.addQuickShootVideo(manageId, fd);
      toast.success('Video uploaded successfully');
      setShowVideoForm(false);
      setVideoTitle('');
      setVideoFile(null);
      loadVideos(manageId);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setVideoSaving(false); }
  };

  const toggleVideoActive = async (vid: string, active: boolean) => {
    if (!manageId) return;
    try {
      const fd = new FormData();
      fd.append('isActive', String(!active));
      await adminAPI.updateQuickShootVideo(vid, fd);
      loadVideos(manageId);
    } catch { toast.error('Failed'); }
  };

  const deleteVideo = async (vid: string) => {
    if (!confirm('Delete this video?') || !manageId) return;
    try { await adminAPI.deleteQuickShootVideo(vid); toast.success('Video deleted'); loadVideos(manageId); }
    catch { toast.error('Delete failed'); }
  };

  // If managing a specific quick shoot, show video management
  if (manageId) {
    return (
      <AdminLayout title={manageName.toUpperCase() + ' VIDEOS'}>
        <button onClick={() => { setManageId(null); setVideos([]); }} style={{ fontSize: 12, color: 'var(--gray)', cursor: 'pointer', marginBottom: 20, background: 'none', border: 'none' }}>← Back to Quick Shoots</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '.06em' }}>{manageName} — VIDEOS ({videos.length})</h3>
          <button onClick={() => setShowVideoForm(!showVideoForm)} className="admin-btn admin-btn-red">{showVideoForm ? 'CANCEL' : '+ ADD VIDEO'}</button>
        </div>
        {showVideoForm && (
          <form onSubmit={addVideo} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32 }}>
            <div className="admin-form">
              <div className="form-group"><label>Video Title</label><input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Enter title" /></div>
              <div className="form-group"><label>Choose Video File</label><input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--gray)' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" disabled={videoSaving} className="admin-btn admin-btn-red">{videoSaving ? 'UPLOADING...' : 'SAVE / ADD VIDEO'}</button>
              <button type="button" onClick={() => setShowVideoForm(false)} className="admin-btn admin-btn-outline">CANCEL</button>
            </div>
          </form>
        )}
        <table className="admin-table">
          <thead><tr><th>#</th><th>Preview</th><th>Title</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {videos.map((v, i) => (
              <tr key={v._id}>
                <td>{i + 1}</td>
                <td>{v.videoFile && <video src={mediaUrl(v.videoFile)} style={{ width: 100, height: 56, objectFit: 'cover', background: '#000' }} />}</td>
                <td style={{ color: 'var(--white)' }}>{v.title || 'Untitled'}</td>
                <td><span className={`badge ${v.isActive ? 'badge-green' : 'badge-red'}`}>{v.isActive ? 'Active' : 'Hidden'}</span></td>
                <td><div className="admin-actions">
                  <button onClick={() => toggleVideoActive(v._id, v.isActive)} className="admin-btn admin-btn-outline">{v.isActive ? 'HIDE' : 'SHOW'}</button>
                  <button onClick={() => deleteVideo(v._id)} className="admin-btn admin-btn-danger">DELETE</button>
                </div></td>
              </tr>
            ))}
            {!videos.length && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No videos yet. Click "+ ADD VIDEO" above.</td></tr>}
          </tbody>
        </table>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="QUICK SHOOTS">
      <div style={{ marginBottom: 24 }}><button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-red">{showForm ? 'CANCEL' : '+ ADD TYPE'}</button></div>
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32, maxWidth: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Name — EN</label><input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} required /></div>
            <div className="form-group"><label>Name — KN</label><input value={form.nameKn} onChange={e => setForm({ ...form, nameKn: e.target.value })} style={{ fontFamily: 'var(--font-kannada)' }} /></div>
          </div>
          <div className="form-group"><label>Display Order</label><input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} style={{ width: 120 }} /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-red">{saving ? 'SAVING...' : 'SAVE'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline">CANCEL</button>
          </div>
        </form>
      )}
      <table className="admin-table">
        <thead><tr><th>Order</th><th>Name (EN)</th><th>Name (KN)</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(q => (
            <tr key={q._id}>
              <td>{q.displayOrder}</td>
              <td style={{ color: 'var(--white)' }}>{q.name?.en}</td>
              <td style={{ fontFamily: 'var(--font-kannada)' }}>{q.name?.kn || '—'}</td>
              <td><span className={`badge ${q.isActive ? 'badge-green' : 'badge-red'}`}>{q.isActive ? 'Active' : 'Hidden'}</span></td>
              <td><div className="admin-actions">
                <button onClick={() => openManage(q)} className="admin-btn admin-btn-outline">MANAGE</button>
                <button onClick={() => toggleActive(q._id, q.isActive)} className="admin-btn admin-btn-outline">{q.isActive ? 'HIDE' : 'SHOW'}</button>
                <button onClick={() => remove(q._id)} className="admin-btn admin-btn-danger">DELETE</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
