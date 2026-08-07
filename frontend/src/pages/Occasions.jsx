import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const meta = {
  birthday: {
    title: 'Birthdays',
    subtitle: 'Celebrate the gift of life in our church family.',
    type: 'birthday',
  },
  anniversary: {
    title: 'Anniversaries',
    subtitle: 'Honor covenant love and God’s faithfulness over the years.',
    type: 'anniversary',
  },
  thanksgiving: {
    title: 'Thanksgiving',
    subtitle: 'Share testimonies of gratitude and answered prayer.',
    type: 'thanksgiving',
  },
};

export default function Occasions({ kind }) {
  const info = meta[kind];
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', message: '', date: '', years: '' });
  const [status, setStatus] = useState('');

  const load = () =>
    api.get('/occasions', { params: { type: info.type } }).then((res) => setItems(res.data));

  useEffect(() => {
    load();
  }, [kind]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setStatus('Please log in to share an occasion.');
      return;
    }
    try {
      await api.post('/occasions', {
        type: info.type,
        name: form.name,
        message: form.message,
        date: form.date,
        years: form.years ? Number(form.years) : undefined,
      });
      setForm({ name: '', message: '', date: '', years: '' });
      setStatus('Shared with the church family!');
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not save');
    }
  };

  return (
    <div className="page">
      <header className="page-banner">
        <p className="eyebrow">Special Occasions</p>
        <h1>{info.title}</h1>
        <p>{info.subtitle}</p>
        <div className="occasion-tabs">
          <Link to="/occasions/birthdays" className={kind === 'birthday' ? 'is-active' : ''}>
            Birthdays
          </Link>
          <Link to="/occasions/anniversaries" className={kind === 'anniversary' ? 'is-active' : ''}>
            Anniversaries
          </Link>
          <Link to="/occasions/thanksgiving" className={kind === 'thanksgiving' ? 'is-active' : ''}>
            Thanksgiving
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="section-inner occasion-layout">
          <div className="occasion-feed">
            {items.map((item) => (
              <article key={item._id} className="occasion-item">
                <time>{format(new Date(item.date), 'MMM d')}</time>
                <div>
                  <h3>
                    {item.name}
                    {item.years ? ` · ${item.years} years` : ''}
                  </h3>
                  {item.message && <p>{item.message}</p>}
                </div>
              </article>
            ))}
            {items.length === 0 && <p className="muted">Nothing posted yet. Be the first!</p>}
          </div>

          <form className="form-panel" onSubmit={onSubmit}>
            <h2>Share yours</h2>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Date
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            {kind === 'anniversary' && (
              <label>
                Years
                <input
                  type="number"
                  min="1"
                  value={form.years}
                  onChange={(e) => setForm({ ...form, years: e.target.value })}
                />
              </label>
            )}
            <label>
              Message
              <textarea
                rows="3"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            {status && <p className="form-status success">{status}</p>}
            <button type="submit" className="btn btn-primary">
              {user ? 'Post occasion' : 'Log in to post'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
