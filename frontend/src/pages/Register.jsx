import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/member-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        <h1>Believer registration</h1>
        <p className="muted">
          Create a believer account. You can later login with either your email or phone number.
        </p>

        <form onSubmit={onSubmit}>
          <label>
            Full name
            <input name="name" required value={form.name} onChange={onChange} />
          </label>
          <label>
            Email
            <input type="email" name="email" required value={form.email} onChange={onChange} />
          </label>
          <label>
            Phone
            <input
              name="phone"
              required
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
              value={form.password}
              onChange={onChange}
            />
          </label>
          {error && <p className="form-status error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Register as Believer'}
          </button>
        </form>

        <p className="auth-foot">
          Already have a believer account? <Link to="/login/believer">Believer Login</Link>
        </p>
        <p className="auth-foot">
          Pastor access? <Link to="/login/pastor">Pastor Login</Link>
        </p>
      </div>
    </div>
  );
}
