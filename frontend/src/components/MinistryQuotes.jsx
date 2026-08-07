import { ministryQuotes } from '../data/ministryQuotes';

export default function MinistryQuotes({ featuredOnly = false }) {
  const quotes = featuredOnly ? ministryQuotes.slice(0, 1) : ministryQuotes;
  const featured = ministryQuotes[0];

  if (featuredOnly) {
    return (
      <section className="section quote-band">
        <div className="section-inner narrow quote-featured">
          <p className="eyebrow">Why Peniel</p>
          <blockquote>
            <p>{featured.text}</p>
            <footer>— {featured.reference}</footer>
          </blockquote>
          <p className="quote-note">{featured.note}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-inner">
        <div className="section-head">
          <h2>God’s Word & our name</h2>
          <p className="muted">Scripture that shapes Peniel Evangelical Fellowship.</p>
        </div>
        <div className="quote-grid">
          {quotes.map((quote) => (
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
    </section>
  );
}
