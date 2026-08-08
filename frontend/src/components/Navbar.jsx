import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { mediaUrl } from '../api/axios';
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
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin-dashboard'
      : user?.role === 'pastor'
        ? '/pastor-dashboard'
        : '/member-dashboard';

  const dashboardLabel =
    user?.role === 'admin'
      ? 'Admin Dashboard'
      : user?.role === 'pastor'
        ? 'Pastor Dashboard'
        : 'Believer Dashboard';

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
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
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
                <Link
                  to={dashboardPath}
                  className="nav-user"
                  onClick={() => setOpen(false)}
                  title={dashboardLabel}
                >
                  <span className="user-avatar nav">
                    {user.avatar ? (
                      <img src={mediaUrl(user.avatar)} alt="" />
                    ) : (
                      <span>{(user.name || '?').charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="nav-user-label">{dashboardLabel}</span>
                </Link>
                <button type="button" className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
