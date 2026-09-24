import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI, mediaUrl } from '../../api';
import toast from 'react-hot-toast';

export default function AdminHomeVideo() {
  const [videos, setVideos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = () => adminAPI.getHomeVideos().then(r => setVideos(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', file.name);
      await adminAPI.uploadHomeVideo(fd);
      toast.success('Video uploaded successfully');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const activate = async (id: string) => {
    try {
      await adminAPI.updateHomeVideo(id, { isActive: true } as any);
      toast.success('Video activated');
      load();
    } catch { toast.error('Failed to activate'); }
  };

  const deactivate = async (id: string) => {
    try {
      await adminAPI.updateHomeVideo(id, { isActive: 'false' } as any);
      toast.success('Video deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await adminAPI.deleteHomeVideo(id);
      toast.success('Video deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="HOME PAGE VIDEO">
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 28, marginBottom: 32, maxWidth: 500 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16, letterSpacing: '.06em' }}>UPLOAD VIDEO</h3>
        <input type="file" accept="video/*" disabled={uploading}
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          style={{ fontSize: 13, color: 'var(--gray)' }} />
        {uploading && <div style={{ marginTop: 12, color: 'var(--red)', fontSize: 13 }}>Uploading... please wait</div>}
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, letterSpacing: '.06em' }}>ALL HOME VIDEOS</h3>
      <table className="admin-table">
        <thead><tr><th>Video</th><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {videos.map(v => (
            <tr key={v._id}>
              <td>
                {v.videoFile && <video src={mediaUrl(v.videoFile)} style={{ width: 120, height: 68, objectFit: 'cover', background: '#000' }} />}
              </td>
              <td style={{ color: 'var(--white)' }}>{v.title || 'Untitled'}</td>
              <td><span className={`badge ${v.isActive ? 'badge-green' : 'badge-gray'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>{new Date(v.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="admin-actions">
                  {!v.isActive && <button onClick={() => activate(v._id)} className="admin-btn admin-btn-outline">ACTIVATE</button>}
                  {v.isActive && <button onClick={() => deactivate(v._id)} className="admin-btn admin-btn-outline">DEACTIVATE</button>}
                  <button onClick={() => remove(v._id)} className="admin-btn admin-btn-danger">DELETE</button>
                </div>
              </td>
            </tr>
          ))}
          {!videos.length && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No videos uploaded yet</td></tr>}
        </tbody>
      </table>
    </AdminLayout>
  );
}
