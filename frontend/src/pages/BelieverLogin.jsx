import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BelieverLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password, 'believer');
      navigate('/member-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Believer login failed');
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
        <p className="eyebrow">Believer portal</p>
        <h1>Believer Login</h1>
        <p className="muted">Sign in to request home programs and follow your approvals.</p>

        <form onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="form-status error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Login as Believer'}
          </button>
        </form>

        <p className="auth-foot">
          New believer? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-foot">
          Are you a pastor? <Link to="/login/pastor">Pastor Login</Link>
        </p>
        <p className="demo-creds muted">
          Demo believer: member@penieleevangelicalfellowship.org / member123
        </p>
      </div>
    </div>
  );
}
