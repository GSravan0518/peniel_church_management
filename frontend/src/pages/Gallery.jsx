import { useEffect, useMemo, useState } from 'react';
import api, { mediaUrl } from '../api/axios';
import Reveal from '../components/Reveal';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'worship', label: 'Worship' },
  { value: 'events', label: 'Events' },
  { value: 'community', label: 'Community' },
  { value: 'missions', label: 'Missions' },
  { value: 'other', label: 'Other' },
];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    api
      .get('/gallery')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (category === 'all') return items;
    return items.filter((item) => item.category === category);
  }, [items, category]);

  const lightbox = lightboxIndex != null ? filtered[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxIndex == null) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i == null ? i : (i + 1) % filtered.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) =>
          i == null ? i : (i - 1 + filtered.length) % filtered.length
        );
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, filtered.length]);

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Gallery</h1>
        <p>Moments of worship, service, and celebration captured in our community.</p>
      </header>

      <Reveal as="section" className="section">
        <div className="section-inner">
          <div className="filter-row" role="group" aria-label="Filter by category">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`filter-chip ${category === c.value ? 'is-active' : ''}`}
                onClick={() => {
                  setCategory(c.value);
                  setLightboxIndex(null);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="page-loading inline">
              <div className="spinner" />
            </div>
          )}

          <div className="gallery-grid">
            {filtered.map((item, index) => (
              <button
                key={item._id}
                type="button"
                className="gallery-item"
                onClick={() => setLightboxIndex(index)}
              >
                <img src={mediaUrl(item.imageUrl)} alt={item.title} loading="lazy" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
          {!loading && filtered.length === 0 && (
            <p className="muted">
              {items.length === 0
                ? 'No pictures yet. Admin can upload from the Admin Dashboard.'
                : 'No pictures in this category.'}
            </p>
          )}
        </div>
      </Reveal>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightboxIndex(null)} role="presentation">
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={mediaUrl(lightbox.imageUrl)} alt={lightbox.title} />
            <figcaption>
              <strong>{lightbox.title}</strong>
              {lightbox.description && <p>{lightbox.description}</p>}
            </figcaption>
            <div className="lightbox-nav">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length)
                }
              >
                Prev
              </button>
              <button
                type="button"
                className="lightbox-close"
                onClick={() => setLightboxIndex(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setLightboxIndex((i) => (i + 1) % filtered.length)}
              >
                Next
              </button>
            </div>
          </figure>
        </div>
      )}
    </div>
  );
}
