import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PrayerWall() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState([]);
  const [form, setForm] = useState({ name: '', request: '', isAnonymous: false });
  const [message, setMessage] = useState('');

  const load = () => api.get('/prayers').then((res) => setPrayers(res.data));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name || '' }));
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prayers', {
        ...form,
        userId: user?.id || user?._id,
      });
      setForm((f) => ({ ...f, request: '', isAnonymous: false }));
      setMessage('Your prayer request was shared.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit request');
    }
  };

  const prayFor = async (id) => {
    const { data } = await api.post(`/prayers/${id}/pray`);
    setPrayers((list) => list.map((p) => (p._id === id ? data : p)));
  };

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Prayer Wall</h1>
        <p>Bring your burdens. Stand with others in faith.</p>
      </header>

      <section className="section">
        <div className="section-inner prayer-layout">
          <form className="form-panel" onSubmit={onSubmit}>
            <h2>Share a request</h2>
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={form.isAnonymous}
                placeholder={form.isAnonymous ? 'Anonymous' : 'Your name'}
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              />
              Post anonymously
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
            {message && <p className="form-status success">{message}</p>}
            <button type="submit" className="btn btn-primary">
              Submit request
            </button>
          </form>

          <div className="prayer-feed">
            {prayers.map((prayer) => (
              <article key={prayer._id} className={`prayer-card ${prayer.isAnswered ? 'answered' : ''}`}>
                <header>
                  <strong>{prayer.name}</strong>
                  <span>{format(new Date(prayer.createdAt), 'MMM d')}</span>
                </header>
                <p>{prayer.request}</p>
                <footer>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => prayFor(prayer._id)}>
                    I prayed ({prayer.prayerCount})
                  </button>
                  {prayer.isAnswered && <span className="tag">Answered</span>}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
