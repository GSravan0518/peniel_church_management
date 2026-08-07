import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery').then((res) => setItems(res.data));
  }, []);

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Gallery</h1>
        <p>Moments of worship, service, and celebration captured in our community.</p>
      </header>

      <section className="section">
        <div className="section-inner">
          <div className="gallery-grid">
            {items.map((item) => (
              <button
                key={item._id}
                type="button"
                className="gallery-item"
                onClick={() => setLightbox(item)}
              >
                <img src={item.imageUrl} alt={item.title} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="presentation">
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.imageUrl} alt={lightbox.title} />
            <figcaption>
              <strong>{lightbox.title}</strong>
              {lightbox.description && <p>{lightbox.description}</p>}
            </figcaption>
            <button type="button" className="lightbox-close" onClick={() => setLightbox(null)}>
              Close
            </button>
          </figure>
        </div>
      )}
    </div>
  );
}
