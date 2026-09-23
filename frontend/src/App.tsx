import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import QuickShootDetailPage from './pages/public/QuickShootDetailPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminServiceDetail from './pages/admin/AdminServiceDetail';
import AdminProjects from './pages/admin/AdminProjects';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminClients from './pages/admin/AdminClients';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminPartners from './pages/admin/AdminPartners';
import AdminHomeVideo from './pages/admin/AdminHomeVideo';
import AdminQuickShoots from './pages/admin/AdminQuickShoots';
import AdminContent from './pages/admin/AdminContent';
import AdminBrand from './pages/admin/AdminBrand';
import ResetPassword from './pages/admin/ResetPassword';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', color: '#fff' }}>Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#161616', color: '#fff', border: '1px solid #222', fontSize: '14px' }
      }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/quick-shoots/:id" element={<QuickShootDetailPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/home" element={<ProtectedRoute><AdminHomeVideo /></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
        <Route path="/admin/services/:id" element={<ProtectedRoute><AdminServiceDetail /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
        <Route path="/admin/enquiries" element={<ProtectedRoute><AdminEnquiries /></ProtectedRoute>} />
        <Route path="/admin/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
        <Route path="/admin/testimonials" element={<ProtectedRoute><AdminTestimonials /></ProtectedRoute>} />
        <Route path="/admin/partners" element={<ProtectedRoute><AdminPartners /></ProtectedRoute>} />
        <Route path="/admin/quick-shoots" element={<ProtectedRoute><AdminQuickShoots /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute><AdminContent /></ProtectedRoute>} />
        <Route path="/admin/brand" element={<ProtectedRoute><AdminBrand /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
