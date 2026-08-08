import { useEffect, useState } from 'react';
import { ministryQuotes } from '../data/ministryQuotes';
import Reveal from './Reveal';

export default function MinistryQuotes({ featuredOnly = false }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!featuredOnly || paused || ministryQuotes.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ministryQuotes.length);
    }, 6500);
    return () => clearInterval(id);
  }, [featuredOnly, paused]);

  if (featuredOnly) {
    const quote = ministryQuotes[index];
    return (
      <Reveal as="section" className="section quote-band">
        <div
          className="section-inner narrow quote-featured quote-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
          }}
        >
          <p className="eyebrow">The Word of God</p>
          <div className="quote-carousel-track" aria-live="polite">
            <blockquote key={quote.id}>
              <p>{quote.text}</p>
              <footer>— {quote.reference}</footer>
            </blockquote>
            <p className="quote-note">{quote.note}</p>
          </div>
          <div className="quote-carousel-controls">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                setIndex((i) => (i - 1 + ministryQuotes.length) % ministryQuotes.length)
              }
              aria-label="Previous quote"
            >
              Prev
            </button>
            <div className="quote-dots" role="tablist" aria-label="Scripture quotes">
              {ministryQuotes.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  className={`quote-dot ${i === index ? 'is-active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Show quote ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIndex((i) => (i + 1) % ministryQuotes.length)}
              aria-label="Next quote"
            >
              Next
            </button>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal as="section" className="section">
      <div className="section-inner">
        <div className="section-head">
          <h2>God’s Word & our name</h2>
          <p className="muted">Scripture that shapes Peniel Evangelical Fellowship.</p>
        </div>
        <div className="quote-grid">
          {ministryQuotes.map((quote) => (
            <article key={quote.id} className="quote-item">
              <blockquote>
                <p>{quote.text}</p>
                <footer>— {quote.reference}</footer>
              </blockquote>
              <p className="quote-note">{quote.note}</p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
