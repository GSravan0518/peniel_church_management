import { communionNote, sundayServices } from '../data/services';
import MinistryQuotes from '../components/MinistryQuotes';

export default function About() {
  return (
    <div className="page">
      <header className="page-hero">
        <div className="page-hero-media">
          <img
            src="https://images.unsplash.com/photo-1478147427282-58a87a120781?w=1600&q=80"
            alt="Church interior with soft light"
          />
          <div className="page-hero-veil" />
        </div>
        <div className="page-hero-content">
          <p className="eyebrow">About</p>
          <h1>Our story of grace</h1>
          <p>
            Peniel means “Face of God”—a fellowship gathered to seek His presence in Gannavaram and
            beyond.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="section-inner prose-grid">
          <div>
            <h2>Why we are called Peniel</h2>
            <p>
              In Genesis 32:30, Jacob named the place Peniel, saying he had seen God face to face and
              his life was preserved. That encounter shapes our ministry name and calling.
            </p>
            <p>
              Peniel Evangelical Fellowship exists so people in Gannavaram, Atkur, Pothavarapadu, and
              surrounding areas may meet God in worship, prayer, and the gospel of Jesus Christ.
            </p>
          </div>
          <div className="values">
            <article>
              <h3>Worship</h3>
              <p>Seeking God’s face together every Sunday.</p>
            </article>
            <article>
              <h3>Community</h3>
              <p>Believers walking together after encountering Christ.</p>
            </article>
            <article>
              <h3>Mission</h3>
              <p>Serving homes and villages around Gannavaram.</p>
            </article>
          </div>
        </div>
      </section>

      <MinistryQuotes />

      <section className="section muted-band">
        <div className="section-inner">
          <h2>Sunday worship locations</h2>
          <p className="muted">
            Join us at any of our four Sunday services across Gannavaram, Atkur, and Pothavarapadu.
          </p>
          <div className="service-list">
            {sundayServices.map((service) => (
              <article key={service.id} className="service-row">
                <span className="service-number">{service.name}</span>
                <div>
                  <h3>{service.location}</h3>
                  <p>{service.time}</p>
                </div>
              </article>
            ))}
          </div>
          <aside className="communion-note">
            <h3>{communionNote.title}</h3>
            <p className="communion-schedule">{communionNote.schedule}</p>
            <p>{communionNote.detail}</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
