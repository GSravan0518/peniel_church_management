import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { eventTypeLabel } from '../data/eventTypes';

export default function PastorDashboard() {
  const [data, setData] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [tab, setTab] = useState('home-programs');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [dash, digest] = await Promise.all([
      api.get('/dashboard/pastor'),
      api.get('/home-programs/weekly-digest'),
    ]);
    setData(dash.data);
    setWeekly(digest.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const setStatus = async (id, status) => {
    await api.patch(`/home-programs/${id}/status`, { status });
    setMessage(`Request ${status}`);
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

  if (!data) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  const weekLabel =
    data.weekStart && data.weekEnd
      ? `${format(new Date(data.weekStart), 'MMM d')} – ${format(new Date(data.weekEnd), 'MMM d')}`
      : '';

  return (
    <div className="page dashboard">
      <header className="page-banner">
        <h1>Pastor Dashboard</h1>
        <p>
          Accept home program slots and review the Sunday–Sunday weekly notification ({weekLabel}).
        </p>
      </header>

      <section className="section">
        <div className="section-inner">
          <div className="dash-tabs">
            {['home-programs', 'weekly', 'notifications', 'prayers', 'messages'].map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? 'is-active' : ''}
                onClick={() => setTab(t)}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>

          {message && <p className="form-status success">{message}</p>}

          {tab === 'home-programs' && (
            <>
              <div className="stat-row pastor-stats">
                <div>
                  <strong>{data.stats.pendingHomePrograms}</strong>
                  <span>Pending slots</span>
                </div>
                <div>
                  <strong>{data.stats.weekRequests}</strong>
                  <span>This week’s requests</span>
                </div>
                <div>
                  <strong>{data.stats.unreadNotifications}</strong>
                  <span>Unread notices</span>
                </div>
                <div>
                  <strong>{data.stats.members}</strong>
                  <span>Members</span>
                </div>
              </div>

              <div className="dash-panel">
                <h2>Pending home program requests</h2>
                <p className="muted">Accept a slot to confirm the program in the believer’s home.</p>
                {data.pendingPrograms.length === 0 && (
                  <p className="muted">No pending requests.</p>
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
                          {item.timeOfDay}
                          {item.phone ? ` · ${item.phone}` : ''}
                        </p>
                        {item.notes && <p className="muted">{item.notes}</p>}
                      </div>
                      <div className="action-pair">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setStatus(item._id, 'accepted')}
                        >
                          Accept slot
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setStatus(item._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {tab === 'weekly' && weekly && (
            <div className="dash-panel">
              <h2>Weekly notification (Sunday to Sunday)</h2>
              <p className="form-status success">{weekly.notification.message}</p>
              <p className="muted">
                Week of {format(new Date(weekly.summary.weekStart), 'MMM d, yyyy')} to{' '}
                {format(new Date(weekly.summary.weekEnd), 'MMM d, yyyy')}
              </p>
              <div className="stat-row pastor-stats">
                <div>
                  <strong>{weekly.summary.total}</strong>
                  <span>Total</span>
                </div>
                <div>
                  <strong>{weekly.summary.pending}</strong>
                  <span>Pending</span>
                </div>
                <div>
                  <strong>{weekly.summary.accepted}</strong>
                  <span>Accepted</span>
                </div>
                <div>
                  <strong>{weekly.summary.rejected}</strong>
                  <span>Rejected</span>
                </div>
              </div>
              <ul className="dash-list stacked">
                {weekly.summary.requests.map((item) => (
                  <li key={item._id}>
                    <div>
                      <strong>
                        {eventTypeLabel(item.eventType)} · {item.name}
                      </strong>
                      <p>
                        {item.place} · {format(new Date(item.date), 'MMM d')} · {item.timeOfDay} ·{' '}
                        {item.status}
                      </p>
                    </div>
                    {item.status === 'pending' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setStatus(item._id, 'accepted')}
                      >
                        Accept
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
              <ul className="dash-list stacked">
                {data.notifications.map((n) => (
                  <li key={n._id}>
                    <div>
                      <strong>
                        {n.title}
                        {!n.isRead ? ' · New' : ''}
                      </strong>
                      <p>{n.message}</p>
                      <span className="muted">{format(new Date(n.createdAt), 'MMM d, yyyy')}</span>
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

          {tab === 'prayers' && (
            <div className="dash-panel">
              <h2>Prayer requests</h2>
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
