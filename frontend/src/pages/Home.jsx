import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { communionNote, sundayServices } from '../data/services';
import MinistryQuotes from '../components/MinistryQuotes';
import Reveal from '../components/Reveal';
import { eventTypeLabel } from '../data/eventTypes';

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [openService, setOpenService] = useState(null);

  useEffect(() => {
    api
      .get('/home-programs', { params: { public: 'true' } })
      .then((res) => setPrograms(res.data.slice(0, 3)))
      .catch(() => setPrograms([]));
  }, []);

  return (
    <>
      <section className="hero home-hero">
        <div className="hero-media home-hero-bg" aria-hidden>
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

      <Reveal as="section" className="section welcome-section home-welcome">
        <div className="section-inner narrow">
          <p className="eyebrow">Face of God</p>
          <h2>We gather that His name may be lifted high</h2>
          <p>
            Peniel means “Face of God.” In Genesis 32:30, Jacob declared he had seen God face to face
            and his life was preserved. That encounter is our calling—to worship the living God,
            proclaim Jesus Christ crucified and risen, and walk together in holiness and love.
          </p>
          <p className="welcome-doxology">
            Not unto us, O Lord, not unto us, but unto Thy name give glory.
          </p>
          <Link to="/about" className="text-link">
            Read our story of grace →
          </Link>
        </div>
      </Reveal>

      <MinistryQuotes featuredOnly />

      <Reveal as="section" id="sunday-services" className="section services-section home-services">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <p className="eyebrow">Lord’s Day</p>
              <h2>Sunday worship</h2>
            </div>
            <p className="muted section-head-note">
              Four gatherings across Gannavaram, Atkur, and Pothavarapadu—one Lord, one faith, one
              gospel.
            </p>
          </div>
          <div className="service-list">
            {sundayServices.map((service) => {
              const isOpen = openService === service.id;
              return (
                <article
                  key={service.id}
                  className={`service-row ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="service-row-toggle"
                    aria-expanded={isOpen}
                    onClick={() => setOpenService(isOpen ? null : service.id)}
                  >
                    <span className="service-number">{service.name}</span>
                    <div>
                      <h3>{service.location}</h3>
                      <p>{service.time}</p>
                    </div>
                  </button>
                  <div className="service-expand">
                    <p>{service.detail}</p>
                    <Link to="/contact" className="text-link">
                      Contact us for directions →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="communion-note">
            <h3>{communionNote.title}</h3>
            <p className="communion-schedule">{communionNote.schedule}</p>
            <p>{communionNote.detail}</p>
          </aside>
        </div>
      </Reveal>

      <Reveal as="section" className="section home-ministry">
        <div className="section-inner home-ministry-inner">
          <p className="eyebrow">Ministry in the home</p>
          <h2>Prayer in every household</h2>
          <p className="muted">
            Believers may request a home program—birthday prayer, thanksgiving, dedication, and more.
            The pastor reviews each request before it is placed on the ministry calendar.
          </p>
          <div className="event-list">
            {programs.length === 0 && (
              <p className="muted home-empty">
                No approved home programs listed yet.{' '}
                <Link to="/events" className="text-link">
                  Request a visit →
                </Link>
              </p>
            )}
            {programs.map((item) => (
              <Link key={item._id} to="/events" className="event-row">
                <div className="event-date">
                  <span>{format(new Date(item.date), 'MMM')}</span>
                  <strong>{format(new Date(item.date), 'd')}</strong>
                </div>
                <div className="event-body">
                  <h3>{item.place}</h3>
                  <p>
                    {eventTypeLabel(item.eventType)} · Host: {item.name} ·{' '}
                    {item.time12h || item.timeOfDay}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {programs.length > 0 && (
            <Link to="/events" className="text-link">
              Request a home program →
            </Link>
          )}
        </div>
      </Reveal>

      <Reveal as="section" className="section invite-band home-invite">
        <div className="section-inner invite-inner">
          <p className="eyebrow light">Come before the Lord</p>
          <h2>Let us pray together</h2>
          <p>
            Cast your cares upon Him, for He cares for you. Share a request, and this fellowship will
            stand with you before the throne of grace.
          </p>
          <div className="hero-actions invite-actions">
            <Link to="/prayer-wall" className="btn btn-primary">
              Prayer Wall
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Contact the church
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
