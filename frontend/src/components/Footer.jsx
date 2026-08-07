import { Link } from 'react-router-dom';
import { sundayServices } from '../data/services';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-brand">
            Peniel <em>Evangelical Fellowship</em>
          </p>
          <p className="footer-copy">
            A community gathered around Christ—worshiping, serving, and growing together near HP Gas
            Station Road, Gannavaram.
          </p>
        </div>
        <div>
          <h4>Sunday Services</h4>
          {sundayServices.map((service) => (
            <p key={service.id}>
              {service.location} · {service.time}
            </p>
          ))}
          <p className="footer-communion">Holy Communion · Every first Sunday</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/events">Events</Link>
          <Link to="/prayer-wall">Prayer Wall</Link>
          <Link to="/login/believer">Believer Login</Link>
          <Link to="/login/pastor">Pastor Login</Link>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} Peniel Evangelical Fellowship. All rights reserved.</p>
    </footer>
  );
}
