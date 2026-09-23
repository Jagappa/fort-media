import { useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { toast.error('Passwords do not match.'); return; }
    if (!token) return;
    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, password);
      toast.success(res.data.message || 'Password reset successful!');
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img src="/fort-media-logo.png" alt="Fort Media" />
        <h2>RESET PASSWORD</h2>
        <p>Create a new password for your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Re-enter password" />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'RESETTING...' : 'RESET PASSWORD'}</button>
        </form>
      </div>
    </div>
  );
}
