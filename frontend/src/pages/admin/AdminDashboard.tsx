import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { adminAPI.getDashboard().then(r => setStats(r.data)).catch(() => {}); }, []);

  if (!stats) return <AdminLayout title="DASHBOARD"><p style={{ color: 'var(--gray)' }}>Loading...</p></AdminLayout>;

  const cards = [
    { value: stats.totalServices, label: 'Total Services', color: '#DC2626' },
    { value: stats.activeServices, label: 'Active Services', color: '#22c55e' },
    { value: stats.totalProjects, label: 'Total Projects', color: '#3b82f6' },
    { value: stats.totalEnquiries, label: 'Total Enquiries', color: '#eab308' },
    { value: stats.newEnquiries, label: 'New Enquiries', color: '#f97316' },
    { value: stats.verifiedPartners, label: 'Verified Partners', color: '#8b5cf6' },
    { value: stats.totalClients, label: 'Clients', color: '#06b6d4' },
    { value: stats.totalTestimonials, label: 'Testimonials', color: '#ec4899' },
  ];

  return (
    <AdminLayout title="DASHBOARD">
      <div className="stat-cards">
        {cards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, letterSpacing: '.06em' }}>RECENT ENQUIRIES</h3>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Service</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {stats.recentEnquiries?.map((e: any) => (
                <tr key={e._id}>
                  <td style={{ color: 'var(--white)' }}>{e.fullName}</td>
                  <td>{e.service}</td>
                  <td><span className={`badge ${e.status === 'new' ? 'badge-green' : e.status === 'contacted' ? 'badge-blue' : 'badge-gray'}`}>{e.status}</span></td>
                  <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!stats.recentEnquiries?.length && <tr><td colSpan={4} style={{ textAlign: 'center' }}>No enquiries yet</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, letterSpacing: '.06em' }}>RECENT PROJECTS</h3>
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentProjects?.map((p: any) => (
                <tr key={p._id}>
                  <td style={{ color: 'var(--white)' }}>{p.title?.en || p.title}</td>
                  <td>{p.category}</td>
                  <td><span className={`badge ${p.isPublished ? 'badge-green' : 'badge-yellow'}`}>{p.isPublished ? 'Published' : 'Draft'}</span></td>
                </tr>
              ))}
              {!stats.recentProjects?.length && <tr><td colSpan={3} style={{ textAlign: 'center' }}>No projects yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
