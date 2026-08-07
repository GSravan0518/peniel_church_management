import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { communionNote, sundayServices } from '../data/services';
import MinistryQuotes from '../components/MinistryQuotes';

export default function Home() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    api
      .get('/home-programs', { params: { public: 'true' } })
      .then((res) => setPrograms(res.data.slice(0, 3)))
      .catch(() => setPrograms([]));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden>
          <img
            src="https://images.unsplash.com/photo-1438232992991-999a1b6f7b5e?w=1800&q=80"
            alt=""
          />
          <div className="hero-veil" />
        </div>
        <div className="hero-content">
          <p className="brand-hero">
            Peniel <em>Evangelical Fellowship</em>
          </p>
          <h1>Come as you are. Leave renewed.</h1>
          <p className="hero-lead">
            Four Sunday worship services across Gannavaram, Atkur, and Pothavarapadu.
          </p>
          <div className="hero-actions">
            <a href="#sunday-services" className="btn btn-primary">
              Sunday Services
            </a>
            <Link to="/about" className="btn btn-outline">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      <section className="section welcome-section">
        <div className="section-inner narrow">
          <h2>A place to belong</h2>
          <p>
            Peniel Evangelical Fellowship is a Christ-centered family where strangers become friends
            and faith becomes lived. Whether you are exploring belief or deepening discipleship, there
            is room for you here.
          </p>
          <Link to="/contact" className="text-link">
            Reach out to our team →
          </Link>
        </div>
      </section>

      <MinistryQuotes featuredOnly />

      <section id="sunday-services" className="section services-section">
        <div className="section-inner">
          <div className="section-head">
            <h2>Sunday worship</h2>
            <p className="muted">Four gatherings across our fellowship locations.</p>
          </div>
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

      <section className="section events-preview">
        <div className="section-inner">
          <div className="section-head">
            <h2>Home programs</h2>
            <Link to="/events" className="text-link">
              Request a home program →
            </Link>
          </div>
          <p className="muted">
            Believers can request a program in their home. The pastor reviews and accepts each slot.
          </p>
          <div className="event-list">
            {programs.length === 0 && (
              <p className="muted">No accepted home programs listed yet.</p>
            )}
            {programs.map((item) => (
              <article key={item._id} className="event-row">
                <div className="event-date">
                  <span>{format(new Date(item.date), 'MMM')}</span>
                  <strong>{format(new Date(item.date), 'd')}</strong>
                </div>
                <div className="event-body">
                  <h3>{item.place}</h3>
                  <p>
                    {item.eventType?.replace(/_/g, ' ')} · Host: {item.name} · {item.timeOfDay}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section invite-band">
        <div className="section-inner invite-inner">
          <h2>Need prayer?</h2>
          <p>Share a request on our prayer wall. Our community stands with you.</p>
          <Link to="/prayer-wall" className="btn btn-primary">
            Visit Prayer Wall
          </Link>
        </div>
      </section>
    </>
  );
}
