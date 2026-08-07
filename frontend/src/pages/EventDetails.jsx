import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setError('Event not found'));
  }, [id]);

  if (error) {
    return (
      <div className="page section">
        <div className="section-inner">
          <p>{error}</p>
          <Link to="/events">Back to events</Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  const booked = event.registrations.length;
  const spotsLeft = Math.max(event.capacity - booked, 0);

  return (
    <div className="page">
      <header className="detail-hero">
        <img
          src={
            event.image ||
            'https://images.unsplash.com/photo-1438232992991-999a1b6f7b5e?w=1600&q=80'
          }
          alt=""
        />
        <div className="detail-hero-veil" />
        <div className="detail-hero-content">
          <p className="eyebrow">Event</p>
          <h1>{event.title}</h1>
          <p>
            {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
            {event.time ? ` · ${event.time}` : ''}
          </p>
        </div>
      </header>

      <section className="section">
        <div className="section-inner detail-layout">
          <div>
            <h2>About this event</h2>
            <p className="lead">{event.description}</p>
            <dl className="detail-meta">
              <div>
                <dt>Location</dt>
                <dd>{event.location}</dd>
              </div>
              <div>
                <dt>Date & time</dt>
                <dd>
                  {format(new Date(event.date), 'MMM d, yyyy')}
                  {event.time ? ` · ${event.time}` : ''}
                </dd>
              </div>
              <div>
                <dt>Appointment slots</dt>
                <dd>
                  {spotsLeft} of {event.capacity} available
                </dd>
              </div>
              <div>
                <dt>Bookings</dt>
                <dd>{booked} confirmed</dd>
              </div>
            </dl>
          </div>
          <aside className="detail-aside">
            <h3>Book your appointment</h3>
            <p>Reserve your place for this service or gathering.</p>
            {spotsLeft > 0 ? (
              <Link to={`/events/${event._id}/register`} className="btn btn-primary">
                Book Appointment
              </Link>
            ) : (
              <p className="form-status error">All appointment slots are full.</p>
            )}
            <Link to="/events" className="text-link">
              ← All events
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
