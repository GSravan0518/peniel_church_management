import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Reveal from '../components/Reveal';

export default function PrayerWall() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', request: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pulseId, setPulseId] = useState(null);

  const load = () =>
    api
      .get('/prayers')
      .then((res) => setPrayers(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name || '' }));
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!String(form.name || '').trim()) {
      setMessage({ type: 'error', text: 'Name is required for a prayer request.' });
      return;
    }
    try {
      const { data } = await api.post('/prayers', {
        name: form.name.trim(),
        request: form.request.trim(),
        userId: user?.id || user?._id,
      });
      setForm((f) => ({ ...f, request: '' }));
      setMessage({
        type: 'success',
        text: data.message || 'Prayer request submitted for pastor approval.',
      });
      load();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not submit request',
      });
    }
  };

  const prayFor = async (id) => {
    setPulseId(id);
    setPrayers((list) =>
      list.map((p) => (p._id === id ? { ...p, prayerCount: (p.prayerCount || 0) + 1 } : p))
    );
    try {
      const { data } = await api.post(`/prayers/${id}/pray`);
      setPrayers((list) => list.map((p) => (p._id === id ? data : p)));
    } catch {
      setPrayers((list) =>
        list.map((p) =>
          p._id === id ? { ...p, prayerCount: Math.max(0, (p.prayerCount || 1) - 1) } : p
        )
      );
    } finally {
      setTimeout(() => setPulseId(null), 550);
    }
  };

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Prayer Wall</h1>
        <p>Share a prayer request. The pastor reviews and approves before it is posted publicly.</p>
      </header>

      <Reveal as="section" className="section">
        <div className="section-inner prayer-layout">
          <form className="form-panel" onSubmit={onSubmit}>
            <h2>Share a request</h2>
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </label>
            <label>
              Prayer request
              <textarea
                rows="4"
                required
                value={form.request}
                onChange={(e) => setForm({ ...form, request: e.target.value })}
              />
            </label>
            {message.text && <p className={`form-status ${message.type}`}>{message.text}</p>}
            <button type="submit" className="btn btn-primary">
              Submit for approval
            </button>
          </form>

          <div className="prayer-feed">
            <h2>Approved prayer requests</h2>
            {loading && (
              <div className="page-loading inline">
                <div className="spinner" />
              </div>
            )}
            {!loading && prayers.length === 0 && (
              <p className="muted">No approved prayer requests yet.</p>
            )}
            {prayers.map((prayer) => (
              <article
                key={prayer._id}
                className={`prayer-card ${prayer.isAnswered ? 'answered' : ''}`}
              >
                <header>
                  <strong>{prayer.name}</strong>
                  <span>{format(new Date(prayer.createdAt), 'MMM d')}</span>
                </header>
                <p>{prayer.request}</p>
                <footer>
                  <button
                    type="button"
                    className={`btn btn-ghost btn-sm pray-btn ${
                      pulseId === prayer._id ? 'is-pulse' : ''
                    }`}
                    onClick={() => prayFor(prayer._id)}
                  >
                    Amen ({prayer.prayerCount})
                  </button>
                  {prayer.isAnswered && <span className="tag">Answered</span>}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
