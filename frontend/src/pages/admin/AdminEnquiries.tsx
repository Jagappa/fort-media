import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

const STATUSES = ['new', 'contacted', 'in-progress', 'converted', 'closed'];
const statusBadge = (s: string) => ({ new: 'badge-green', contacted: 'badge-blue', 'in-progress': 'badge-yellow', converted: 'badge-green', closed: 'badge-gray' }[s] || 'badge-gray');

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const load = () => adminAPI.getEnquiries(filter ? { status: filter } : undefined).then(r => setEnquiries(r.data)).catch(() => {});
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await adminAPI.updateEnquiry(id, { status });
    toast.success(`Status updated to ${status}`);
    load();
    if (detail?._id === id) setDetail({ ...detail, status });
  };

  return (
    <AdminLayout title="ENQUIRIES">
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={() => setFilter('')} className={`admin-btn ${!filter ? 'admin-btn-red' : 'admin-btn-outline'}`}>ALL</button>
        {STATUSES.map(s => <button key={s} onClick={() => setFilter(s)} className={`admin-btn ${filter === s ? 'admin-btn-red' : 'admin-btn-outline'}`}>{s.toUpperCase()}</button>)}
      </div>

      {detail ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 32, marginBottom: 24 }}>
          <button onClick={() => setDetail(null)} style={{ fontSize: 12, color: 'var(--gray)', cursor: 'pointer', marginBottom: 16 }}>← Back to list</button>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20 }}>{detail.fullName}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {[['Phone', detail.phone], ['Email', detail.email], ['Business', detail.businessName], ['Service', detail.service], ['Shoot Type', detail.shootType], ['Budget', detail.budget], ['Date', new Date(detail.createdAt).toLocaleString()]].map(([l, v]) => (
              v ? <div key={l as string}><div style={{ fontSize: 11, color: 'var(--gray-dark)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div><div style={{ fontSize: 15 }}>{v as string}</div></div> : null
            ))}
          </div>
          {detail.message && <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, color: 'var(--gray-dark)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>MESSAGE</div><div style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.7, padding: 16, background: 'var(--bg)', border: '1px solid var(--border)' }}>{detail.message}</div></div>}
          <div><div style={{ fontSize: 11, color: 'var(--gray-dark)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>UPDATE STATUS</div>
          <div className="admin-actions">{STATUSES.map(s => <button key={s} onClick={() => updateStatus(detail._id, s)} className={`admin-btn ${detail.status === s ? 'admin-btn-red' : 'admin-btn-outline'}`}>{s.toUpperCase()}</button>)}</div></div>
        </div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Service</th><th>Shoot Type</th><th>Budget</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {enquiries.map(e => (
              <tr key={e._id}>
                <td style={{ color: 'var(--white)', cursor: 'pointer' }} onClick={() => setDetail(e)}>{e.fullName}</td>
                <td>{e.phone}</td>
                <td>{e.service}</td>
                <td>{e.shootType || '—'}</td>
                <td>{e.budget || '—'}</td>
                <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                <td><button onClick={() => setDetail(e)} className="admin-btn admin-btn-outline">VIEW</button></td>
              </tr>
            ))}
            {!enquiries.length && <tr><td colSpan={8} style={{ textAlign: 'center' }}>No enquiries</td></tr>}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
