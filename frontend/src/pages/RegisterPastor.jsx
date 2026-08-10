import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
};

export default function RegisterPastor() {
  const { registerPastor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password;

    if (!name || !email || !phone || !password) {
      setError('Please fill in name, email, phone, and password.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const data = await registerPastor({ name, email, phone, password });
      setSuccess(data.message || 'Pastor account created. Please log in.');
      setTimeout(() => {
        navigate('/login/pastor', {
          replace: true,
          state: {
            registered: true,
            emailOrPhone: email,
            message: 'Pastor registration successful. Please log in to continue.',
          },
        });
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Pastor registration failed');
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
        <h1>Pastor registration</h1>
        <p className="muted">
          Create your pastor account. After registering, sign in with your email or phone number.
        </p>

        <form onSubmit={onSubmit}>
          <label>
            Full name
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Your full name"
              value={form.name}
              onChange={onChange}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
            />
          </label>
          <label>
            Phone
            <input
              name="phone"
              required
              autoComplete="tel"
              placeholder="Used for login too"
              value={form.phone}
              onChange={onChange}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              minLength={6}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={onChange}
            />
          </label>
          {error && <p className="form-status error">{error}</p>}
          {success && <p className="form-status success">{success}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Register as Pastor'}
          </button>
        </form>

        <p className="auth-foot">
          Already have a pastor account? <Link to="/login/pastor">Pastor Login</Link>
        </p>
        <p className="auth-foot">
          Registering as a believer? <Link to="/register">Believer registration</Link>
        </p>
      </div>
    </div>
  );
}
