import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI, mediaUrl } from '../../api';
import toast from 'react-hot-toast';

export default function AdminServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!id) return;
    adminAPI.getService(id).then(r => { setService(r.data.service); setVideos(r.data.videos || []); }).catch(() => {});
  };
  useEffect(load, [id]);

  const addVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoFile) { toast.error('Please select a video file.'); return; }
    if (!id) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('video', videoFile);
      fd.append('titleEn', title || videoFile.name);
      fd.append('displayOrder', String(videos.length + 1));
      await adminAPI.addServiceVideo(id, fd);
      toast.success('Video uploaded successfully');
      setShowForm(false);
      setTitle('');
      setVideoFile(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally { setSaving(false); }
  };

  const toggleVideo = async (vid: string, active: boolean) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(!active));
      await adminAPI.updateServiceVideo(vid, fd);
      toast.success(active ? 'Video hidden' : 'Video activated');
      load();
    } catch { toast.error('Failed'); }
  };

  const deleteVideo = async (vid: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await adminAPI.deleteServiceVideo(vid);
      toast.success('Video deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  if (!service) return <AdminLayout title="SERVICE"><p style={{ color: 'var(--gray)' }}>Loading...</p></AdminLayout>;

  return (
    <AdminLayout title={service.name?.en || 'SERVICE'}>
      <Link to="/admin/services" style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 20, display: 'inline-block' }}>← Back to Services</Link>
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <span className={`badge ${service.isActive ? 'badge-green' : 'badge-red'}`}>{service.isActive ? 'Active' : 'Inactive'}</span>
        {service.isFeatured && <span className="badge badge-yellow">Featured</span>}
      </div>
      {service.description?.en && <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 40, maxWidth: 600 }}>{service.description.en}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '.06em' }}>SERVICE VIDEOS ({videos.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-red">{showForm ? 'CANCEL' : '+ ADD VIDEO'}</button>
      </div>

      {showForm && (
        <form onSubmit={addVideo} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32 }}>
          <div className="admin-form">
            <div className="form-group"><label>Video Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter video title" /></div>
            <div className="form-group"><label>Choose Video File</label><input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: 'var(--gray)' }} /></div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-red">{saving ? 'UPLOADING...' : 'SAVE / ADD VIDEO'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline">CANCEL</button>
          </div>
        </form>
      )}

      <table className="admin-table">
        <thead><tr><th>#</th><th>Preview</th><th>Title</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {videos.map((v, i) => (
            <tr key={v._id}>
              <td>{v.displayOrder || i + 1}</td>
              <td>{v.videoFile && <video src={mediaUrl(v.videoFile)} style={{ width: 100, height: 56, objectFit: 'cover', background: '#000' }} />}</td>
              <td style={{ color: 'var(--white)' }}>{v.title?.en || v.title || 'Untitled'}</td>
              <td><span className={`badge ${v.isActive ? 'badge-green' : 'badge-red'}`}>{v.isActive ? 'Active' : 'Hidden'}</span></td>
              <td>
                <div className="admin-actions">
                  <button onClick={() => toggleVideo(v._id, v.isActive)} className="admin-btn admin-btn-outline">{v.isActive ? 'HIDE' : 'SHOW'}</button>
                  <button onClick={() => deleteVideo(v._id)} className="admin-btn admin-btn-danger">DELETE</button>
                </div>
              </td>
            </tr>
          ))}
          {!videos.length && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No videos yet. Click "+ ADD VIDEO" above.</td></tr>}
        </tbody>
      </table>
    </AdminLayout>
  );
}
