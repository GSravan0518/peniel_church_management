import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PastorLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    emailOrPhone: location.state?.emailOrPhone || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [info] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.emailOrPhone, form.password, 'pastor');
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
        <p className="muted">Sign in with your email or phone number.</p>

        {info && <p className="form-status success">{info}</p>}

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
            {loading ? 'Signing in…' : 'Login as Pastor'}
          </button>
        </form>

        <p className="auth-foot">
          New pastor? <Link to="/register/pastor">Register as Pastor</Link>
        </p>
        <p className="auth-foot">
          Are you a believer? <Link to="/login/believer">Believer Login</Link>
        </p>
      </div>
    </div>
  );
}
