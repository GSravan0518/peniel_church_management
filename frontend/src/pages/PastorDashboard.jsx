import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import api from '../api/axios';
import { eventTypeLabel } from '../data/eventTypes';

export default function PastorDashboard() {
  const [data, setData] = useState(null);
  const [calendar, setCalendar] = useState({ events: [], todays: [] });
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [tab, setTab] = useState('calendar');
  const [message, setMessage] = useState('');

  const monthKey = format(monthCursor, 'yyyy-MM');

  const load = async () => {
    const [dash, cal] = await Promise.all([
      api.get('/dashboard/pastor'),
      api.get('/calendar', { params: { month: monthKey } }),
    ]);
    setData(dash.data);
    setCalendar(cal.data);
    if (dash.data.stats?.newDayNotifications > 0) {
      setMessage(
        `${dash.data.stats.newDayNotifications} day-of program notification(s) created for today.`
      );
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [monthKey]);

  const setProgramStatus = async (id, status) => {
    await api.patch(`/home-programs/${id}/status`, { status });
    setMessage(
      status === 'accepted'
        ? 'Program approved and saved to calendar.'
        : `Request ${status}`
    );
    load();
  };

  const setPrayerStatus = async (id, status) => {
    await api.patch(`/prayers/${id}/status`, { status });
    setMessage(`Prayer ${status}`);
    load();
  };

  const markAnswered = async (id) => {
    await api.patch(`/prayers/${id}/answered`);
    load();
  };

  const markRead = async (id) => {
    await api.patch(`/contact/${id}/read`);
    load();
  };

  const markNotificationRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor));
    const end = endOfWeek(endOfMonth(monthCursor));
    return eachDayOfInterval({ start, end });
  }, [monthCursor]);

  const eventsOnSelected = (calendar.events || []).filter((event) =>
    isSameDay(new Date(event.date), selectedDay)
  );

  if (!data) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page dashboard">
      <header className="page-banner">
        <h1>Pastor Dashboard</h1>
        <p>
          Approve prayer requests and event bookings. When you approve a booking, its date and time
          are saved on the calendar. On that day the system sends you a reminder notification.
        </p>
      </header>

      <section className="section">
        <div className="section-inner">
          <div className="dash-tabs">
            {['calendar', 'bookings', 'prayers', 'notifications', 'messages'].map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? 'is-active' : ''}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {message && <p className="form-status success">{message}</p>}

          <div className="stat-row pastor-stats">
            <div>
              <strong>{data.stats.pendingHomePrograms}</strong>
              <span>Pending bookings</span>
            </div>
            <div>
              <strong>{data.stats.pendingPrayers}</strong>
              <span>Pending prayers</span>
            </div>
            <div>
              <strong>{data.stats.todayPrograms}</strong>
              <span>Today’s programs</span>
            </div>
            <div>
              <strong>{data.stats.unreadNotifications}</strong>
              <span>Unread notices</span>
            </div>
          </div>

          {tab === 'calendar' && (
            <div className="calendar-layout">
              <div className="dash-panel">
                <div className="calendar-toolbar">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setMonthCursor((d) => addMonths(d, -1))}
                  >
                    Prev
                  </button>
                  <h2>{format(monthCursor, 'MMMM yyyy')}</h2>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setMonthCursor((d) => addMonths(d, 1))}
                  >
                    Next
                  </button>
                </div>

                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="calendar-dow">
                      {d}
                    </div>
                  ))}
                  {monthDays.map((day) => {
                    const dayEvents = (calendar.events || []).filter((event) =>
                      isSameDay(new Date(event.date), day)
                    );
                    const isSelected = isSameDay(day, selectedDay);
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        className={[
                          'calendar-day',
                          !isSameMonth(day, monthCursor) ? 'is-muted' : '',
                          isSelected ? 'is-selected' : '',
                          dayEvents.length ? 'has-events' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setSelectedDay(day)}
                      >
                        <span>{format(day, 'd')}</span>
                        {dayEvents.length > 0 && (
                          <em>
                            {dayEvents.length} · {dayEvents[0].time12h}
                          </em>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="dash-panel">
                <h2>Reminders · {format(selectedDay, 'EEE, MMM d')}</h2>
                {isSameDay(selectedDay, new Date()) && (
                  <p className="form-status success">
                    Programs scheduled for today automatically notify the pastor (checked every 15
                    minutes and when you open this page).
                  </p>
                )}
                {eventsOnSelected.length === 0 && (
                  <p className="muted">No approved programs on this day.</p>
                )}
                <ul className="dash-list stacked">
                  {eventsOnSelected.map((event) => (
                    <li key={event._id}>
                      <div>
                        <strong>
                          {event.time12h} · {event.title}
                        </strong>
                        <p>
                          {event.hostName} · {event.place}
                        </p>
                        {event.notes && <p className="muted">{event.notes}</p>}
                      </div>
                    </li>
                  ))}
                </ul>

                <h3>Today at a glance</h3>
                <ul className="dash-list">
                  {(data.todaysPrograms || []).map((event) => (
                    <li key={event._id}>
                      <span>
                        {event.time12h} · {event.title}
                      </span>
                      <span>{event.place}</span>
                    </li>
                  ))}
                  {(data.todaysPrograms || []).length === 0 && (
                    <li>
                      <span className="muted">No programs scheduled today</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {tab === 'bookings' && (
            <div className="dash-panel">
              <h2>Pending event bookings</h2>
              <p className="muted">
                Approve to store the program on your calendar with 12-hour time.
              </p>
              {data.pendingPrograms.length === 0 && (
                <p className="muted">No pending bookings.</p>
              )}
              <ul className="dash-list stacked">
                {data.pendingPrograms.map((item) => (
                  <li key={item._id}>
                    <div>
                      <strong>
                        {eventTypeLabel(item.eventType)} · {item.name}
                      </strong>
                      <p>
                        {item.place} · {format(new Date(item.date), 'EEEE, MMM d, yyyy')} ·{' '}
                        {item.time12h}
                        {item.phone ? ` · ${item.phone}` : ''}
                      </p>
                      {item.notes && <p className="muted">{item.notes}</p>}
                    </div>
                    <div className="action-pair">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setProgramStatus(item._id, 'accepted')}
                      >
                        Approve & add to calendar
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setProgramStatus(item._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <h3>Upcoming calendar</h3>
              <ul className="dash-list">
                {(data.upcomingCalendar || []).map((event) => (
                  <li key={event._id}>
                    <span>
                      {event.title} · {event.hostName}
                    </span>
                    <span>
                      {format(new Date(event.date), 'MMM d')} · {event.time12h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'prayers' && (
            <div className="dash-panel">
              <h2>Pending prayer requests</h2>
              {data.pendingPrayers.length === 0 && (
                <p className="muted">No pending prayer requests.</p>
              )}
              <ul className="dash-list stacked">
                {data.pendingPrayers.map((p) => (
                  <li key={p._id}>
                    <div>
                      <strong>{p.name}</strong>
                      <p>{p.request}</p>
                    </div>
                    <div className="action-pair">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setPrayerStatus(p._id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPrayerStatus(p._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <h3>Approved prayers</h3>
              <ul className="dash-list stacked">
                {data.prayers.map((p) => (
                  <li key={p._id}>
                    <div>
                      <strong>{p.name}</strong>
                      <p>{p.request}</p>
                    </div>
                    {!p.isAnswered && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => markAnswered(p._id)}
                      >
                        Mark answered
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="dash-panel">
              <h2>Pastor notifications</h2>
              <p className="muted">
                Includes booking requests, approvals, and day-of program reminders.
              </p>
              <ul className="dash-list stacked">
                {data.notifications.map((n) => (
                  <li key={n._id}>
                    <div>
                      <strong>
                        {n.title}
                        {!n.isRead ? ' · New' : ''}
                      </strong>
                      <p>{n.message}</p>
                      <span className="muted">
                        {n.type.replace(/_/g, ' ')} ·{' '}
                        {format(new Date(n.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {!n.isRead && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => markNotificationRead(n._id)}
                      >
                        Mark read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'messages' && (
            <div className="dash-panel">
              <h2>Contact messages</h2>
              {data.messages.length === 0 && <p className="muted">No unread messages.</p>}
              <ul className="dash-list stacked">
                {data.messages.map((m) => (
                  <li key={m._id}>
                    <div>
                      <strong>
                        {m.name} · {m.subject}
                      </strong>
                      <p>{m.message}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => markRead(m._id)}
                    >
                      Mark read
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
