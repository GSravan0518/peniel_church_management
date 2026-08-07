import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PastorLogin() {
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
      await login(form.email, form.password, 'pastor');
      navigate('/pastor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Pastor login failed');
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
        <p className="eyebrow">Pastor portal</p>
        <h1>Pastor Login</h1>
        <p className="muted">Sign in to accept home program slots and review weekly requests.</p>

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
            {loading ? 'Signing in…' : 'Login as Pastor'}
          </button>
        </form>

        <p className="auth-foot">
          Are you a believer? <Link to="/login/believer">Believer Login</Link>
        </p>
        <p className="demo-creds muted">
          Demo pastor: pastor@penieleevangelicalfellowship.org / pastor123
        </p>
      </div>
    </div>
  );
}
