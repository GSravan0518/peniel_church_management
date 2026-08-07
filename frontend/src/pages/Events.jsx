import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { EVENT_TYPES, eventTypeLabel } from '../data/eventTypes';

const emptyForm = {
  name: '',
  place: '',
  eventType: 'birthday_prayer',
  date: '',
  timeOfDay: 'AM',
  phone: '',
  notes: '',
};

export default function Events() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState([]);

  const loadAccepted = () =>
    api
      .get('/home-programs', { params: { public: 'true' } })
      .then((res) => setAccepted(res.data))
      .catch(() => setAccepted([]));

  useEffect(() => {
    loadAccepted();
  }, []);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || f.name,
        phone: user.phone || f.phone,
      }));
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await api.post('/home-programs', {
        ...form,
        userId: user?.id || user?._id,
      });
      setStatus({ type: 'success', message: data.message });
      setForm((f) => ({
        ...emptyForm,
        name: user?.name || '',
        phone: user?.phone || '',
      }));
      loadAccepted();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Could not submit request',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Home Programs</h1>
        <p>
          Request a program in a believer’s home for birthdays, anniversaries, thanksgiving, and
          other occasions. Sunday worship services are separate. The pastor will accept the slot.
        </p>
      </header>

      <section className="section">
        <div className="section-inner event-request-layout">
          <form className="form-panel" onSubmit={onSubmit}>
            <h2>Register a home program</h2>
            <p className="muted">
              Required: name, event type, place, date, and time (AM or PM).
            </p>

            <label>
              Name
              <input name="name" value={form.name} onChange={onChange} required />
            </label>
            <label>
              Event type
              <select name="eventType" value={form.eventType} onChange={onChange} required>
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Place (believer’s home / area)
              <input
                name="place"
                value={form.place}
                onChange={onChange}
                placeholder="e.g. Srinagar Colony, Gannavaram"
                required
              />
            </label>
            <label>
              Date
              <input type="date" name="date" value={form.date} onChange={onChange} required />
            </label>
            <fieldset className="time-period">
              <legend>Time</legend>
              <label className="radio-row">
                <input
                  type="radio"
                  name="timeOfDay"
                  value="AM"
                  checked={form.timeOfDay === 'AM'}
                  onChange={onChange}
                />
                AM
              </label>
              <label className="radio-row">
                <input
                  type="radio"
                  name="timeOfDay"
                  value="PM"
                  checked={form.timeOfDay === 'PM'}
                  onChange={onChange}
                />
                PM
              </label>
            </fieldset>
            <label>
              Phone (optional)
              <input name="phone" value={form.phone} onChange={onChange} />
            </label>
            <label>
              Notes (optional)
              <textarea name="notes" rows="3" value={form.notes} onChange={onChange} />
            </label>

            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for pastor approval'}
            </button>
          </form>

          <div className="accepted-programs">
            <h2>Accepted home programs</h2>
            <p className="muted">Confirmed by the pastor for upcoming dates.</p>
            {accepted.length === 0 && <p className="muted">No accepted programs yet.</p>}
            <ul className="dash-list">
              {accepted.map((item) => (
                <li key={item._id}>
                  <div>
                    <strong>{item.place}</strong>
                    <p>
                      {eventTypeLabel(item.eventType)} · Host: {item.name} · {item.timeOfDay}
                    </p>
                  </div>
                  <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
