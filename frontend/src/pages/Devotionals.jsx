import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';

export default function Devotionals() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get('/devotions').then((res) => {
      setItems(res.data);
      setActive(res.data[0] || null);
    });
  }, []);

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Devotionals</h1>
        <p>Daily Scripture reflections to steady your walk with Christ.</p>
      </header>

      <section className="section">
        <div className="section-inner devotion-layout">
          <aside className="devotion-list">
            {items.map((item) => (
              <button
                key={item._id}
                type="button"
                className={`devotion-item ${active?._id === item._id ? 'is-active' : ''}`}
                onClick={() => setActive(item)}
              >
                <span>{format(new Date(item.date), 'MMM d')}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
            {items.length === 0 && <p className="muted">No devotionals yet.</p>}
          </aside>

          {active && (
            <article className="devotion-reader">
              <p className="eyebrow">{active.scripture}</p>
              <h2>{active.title}</h2>
              <p className="meta">
                {active.author} · {format(new Date(active.date), 'MMMM d, yyyy')}
              </p>
              <p className="lead">{active.content}</p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
