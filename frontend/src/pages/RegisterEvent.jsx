import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegisterEvent() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    notes: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setEvent(null));
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'guests' ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      await api.post(`/events/${id}/register`, {
        ...form,
        userId: user?.id || user?._id,
      });
      setStatus({
        type: 'success',
        message: 'Appointment booked successfully. We look forward to seeing you.',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Could not book appointment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  const spotsLeft = Math.max(event.capacity - event.registrations.length, 0);

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Book Appointment</h1>
        <p>
          {event.title} · {format(new Date(event.date), 'MMM d, yyyy')} · {event.time}
        </p>
        <p className="muted">
          {event.location} · {spotsLeft} slots left
        </p>
      </header>

      <section className="section">
        <div className="section-inner form-narrow">
          <form className="form-panel" onSubmit={onSubmit}>
            <p className="muted">
              Fill in your details to confirm your appointment for this event.
            </p>
            <label>
              Full name
              <input name="name" value={form.name} onChange={onChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={onChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={onChange} required />
            </label>
            <label>
              Number of people (including you)
              <input
                type="number"
                name="guests"
                min="1"
                max="10"
                value={form.guests}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Special request / notes
              <textarea
                name="notes"
                rows="3"
                value={form.notes}
                onChange={onChange}
                placeholder="Any prayer need or seating request"
              />
            </label>

            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || spotsLeft < 1 || status.type === 'success'}
              >
                {submitting ? 'Booking…' : 'Confirm Appointment'}
              </button>
              <Link to={`/events/${id}`} className="text-link">
                Back to details
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
