import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { path: '/admin', label: 'Dashboard', icon: '◆' },
  { path: '/admin/home', label: 'Home Page', icon: '▶' },
  { path: '/admin/services', label: 'Services', icon: '◇' },
  { path: '/admin/projects', label: 'Portfolio', icon: '■' },
  { path: '/admin/quick-shoots', label: 'Quick Shoots', icon: '▸' },
  { path: '/admin/partners', label: 'Partners', icon: '◎' },
  { path: '/admin/enquiries', label: 'Enquiries', icon: '✉' },
  { path: '/admin/clients', label: 'Clients', icon: '★' },
  { path: '/admin/testimonials', label: 'Testimonials', icon: '❝' },
  { path: '/admin/content', label: 'Content', icon: '▤' },
  { path: '/admin/brand', label: 'Brand', icon: '◈' },
];

export default function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { admin, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/fort-media-logo.png" alt="Fort Media" />
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--gray-dark)', letterSpacing: '.15em', textTransform: 'uppercase' }}>ADMIN DASHBOARD</div>
        </div>
        <nav className="admin-nav">
          {links.map(l => (
            <NavLink key={l.path} to={l.path} end={l.path === '/admin'}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <span style={{ fontSize: 12, opacity: .5, width: 18, textAlign: 'center' }}>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0', padding: '16px 24px 0' }}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>{admin?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-dark)', marginBottom: 12 }}>{admin?.email}</div>
          <button onClick={logout} style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--red)', cursor: 'pointer' }}>Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <h1>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
