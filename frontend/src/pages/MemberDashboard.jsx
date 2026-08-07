import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { eventTypeLabel } from '../data/eventTypes';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/member').then((res) => setData(res.data));
  }, []);

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
        <h1>Believer Dashboard</h1>
        <p>Welcome, {user?.name?.split(' ')[0]}. Track your home program requests here.</p>
      </header>

      <section className="section">
        <div className="section-inner dash-grid">
          <article className="dash-panel">
            <h2>Your home program requests</h2>
            {data.myRequests.length === 0 && (
              <p className="muted">
                No requests yet. <Link to="/events">Request a home program</Link>
              </p>
            )}
            <ul className="dash-list">
              {data.myRequests.map((item) => (
                <li key={item._id}>
                  <div>
                    <Link to="/events">{eventTypeLabel(item.eventType)}</Link>
                    <p className="muted">
                      {item.place} · {format(new Date(item.date), 'MMM d')} · {item.timeOfDay}
                    </p>
                  </div>
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="dash-panel">
            <h2>Accepted programs</h2>
            <ul className="dash-list">
              {data.acceptedPrograms.map((item) => (
                <li key={item._id}>
                  <div>
                    <span>{eventTypeLabel(item.eventType)}</span>
                    <p className="muted">{item.place}</p>
                  </div>
                  <span>
                    {format(new Date(item.date), 'MMM d')} · {item.timeOfDay}
                  </span>
                </li>
              ))}
              {data.acceptedPrograms.length === 0 && (
                <li>
                  <span className="muted">None scheduled yet</span>
                </li>
              )}
            </ul>
          </article>

          <article className="dash-panel span-2 quick-links">
            <h2>Quick links</h2>
            <div className="link-row">
              <Link to="/events">Request home program</Link>
              <Link to="/prayer-wall">Prayer Wall</Link>
              <Link to="/#sunday-services">Sunday Services</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
