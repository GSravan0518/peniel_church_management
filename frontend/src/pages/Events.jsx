import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { EVENT_TYPES, eventTypeLabel } from '../data/eventTypes';
import Reveal from '../components/Reveal';

/** Convert HH:MM (24h) to 12-hour display, e.g. 14:30 → 02:30 PM */
function toTime12h(hhmm) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return '';
  const [hStr, mStr] = hhmm.split(':');
  let hour = Number(hStr);
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${mStr} ${meridiem}`;
}

const emptyForm = {
  name: '',
  place: '',
  eventType: '',
  date: '',
  time: '',
  phone: '',
  notes: '',
};

export default function Events() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState([]);

  const time12h = useMemo(() => toTime12h(form.time), [form.time]);
  const previewReady = Boolean(form.name && form.eventType && form.place && form.date && form.time);

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

    if (!form.eventType) {
      setStatus({ type: 'error', message: 'Please choose an occasion.' });
      setSubmitting(false);
      return;
    }

    if (!form.time) {
      setStatus({ type: 'error', message: 'Please choose a time (HH:MM).' });
      setSubmitting(false);
      return;
    }

    try {
      const { data } = await api.post('/home-programs', {
        name: form.name,
        place: form.place,
        eventType: form.eventType,
        date: form.date,
        time12h,
        phone: form.phone,
        notes: form.notes,
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
        message: err.response?.data?.message || 'Could not submit booking',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Event booking</h1>
        <p>
          Book a home program for birthdays, anniversaries, thanksgiving, and other occasions. The
          pastor must approve before it is added to the ministry calendar.
        </p>
      </header>

      <Reveal as="section" className="section">
        <div className="section-inner event-request-layout">
          <form className="form-panel" onSubmit={onSubmit}>
            <h2>Book a home program</h2>
            <p className="muted">
              Required: name, event type, place, date, and time (HH:MM).
            </p>

            <label>
              Name
              <input name="name" value={form.name} onChange={onChange} required />
            </label>

            <div>
              <span className="field-label">Occasion</span>
              <div className="occasion-chips" role="group" aria-label="Occasion type">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`filter-chip ${form.eventType === type.value ? 'is-active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, eventType: type.value }))}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

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

            <label>
              Time (HH:MM)
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={onChange}
                required
              />
              {time12h && <span className="time-hint">Shown as {time12h}</span>}
            </label>

            <label>
              Phone (optional)
              <input name="phone" value={form.phone} onChange={onChange} />
            </label>
            <label>
              Notes (optional)
              <textarea name="notes" rows="3" value={form.notes} onChange={onChange} />
            </label>

            <aside
              className={`booking-preview ${previewReady ? 'is-ready' : ''}`}
              aria-live="polite"
            >
              <p className="eyebrow">Live preview</p>
              <strong>
                {form.eventType ? eventTypeLabel(form.eventType) : 'Choose an occasion'}
              </strong>
              <p>
                {form.name || 'Your name'}
                {form.place ? ` · ${form.place}` : ''}
              </p>
              <p className="muted">
                {form.date
                  ? format(new Date(`${form.date}T12:00:00`), 'EEEE, MMM d, yyyy')
                  : 'Pick a date'}
                {time12h ? ` · ${time12h}` : ''}
              </p>
            </aside>

            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !form.eventType}
            >
              {submitting ? 'Submitting…' : 'Submit for pastor approval'}
            </button>
          </form>

          <div className="accepted-programs">
            <h2>Approved programs</h2>
            <p className="muted">Confirmed by the pastor and saved on the calendar.</p>
            {accepted.length === 0 && <p className="muted">No approved programs yet.</p>}
            <ul className="dash-list">
              {accepted.map((item) => (
                <li key={item._id}>
                  <div>
                    <strong>{item.place}</strong>
                    <p>
                      {eventTypeLabel(item.eventType)} · Host: {item.name} · {item.time12h}
                    </p>
                  </div>
                  <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
