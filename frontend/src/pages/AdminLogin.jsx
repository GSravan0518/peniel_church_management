import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.emailOrPhone, form.password, 'admin');
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-panel">
        <p className="brand-hero compact">
          Peniel <em>Evangelical Fellowship</em>
        </p>
        <p className="eyebrow">Admin portal</p>
        <h1>Admin Login</h1>
        <p className="muted">
          Full website monitoring and authority to upload gallery pictures.
        </p>

        <form onSubmit={onSubmit}>
          <label>
            Email or phone
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="email@example.com or phone number"
              value={form.emailOrPhone}
              onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="form-status error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Login as Admin'}
          </button>
        </form>

        <p className="auth-foot">
          Pastor access? <Link to="/login/pastor">Pastor Login</Link>
        </p>
      </div>
    </div>
  );
}
