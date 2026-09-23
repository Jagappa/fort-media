import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, admin } = useAuth();
  const navigate = useNavigate();

  if (admin) { navigate('/admin', { replace: true }); return null; }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img src="/fort-media-logo.png" alt="Fort Media" />
        <h2>ADMIN LOGIN</h2>
        <p>Sign in to manage Fort Media</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@fortmedia.in" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: 12 }}>
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</button>
        </form>
      </div>
    </div>
  );
}
