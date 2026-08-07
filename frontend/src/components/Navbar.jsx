import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/prayer-wall', label: 'Prayer Wall' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const isPastor = user?.role === 'pastor' || user?.role === 'admin';
  const dashboardPath = isPastor ? '/pastor-dashboard' : '/member-dashboard';

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">
            Peniel <em>Evangelical Fellowship</em>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}

          <div className="nav-auth">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn btn-ghost" onClick={() => setOpen(false)}>
                  {isPastor ? 'Pastor Dashboard' : 'Believer Dashboard'}
                </Link>
                <button type="button" className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login/believer" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Believer Login
                </Link>
                <Link to="/login/pastor" className="btn btn-primary" onClick={() => setOpen(false)}>
                  Pastor Login
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
