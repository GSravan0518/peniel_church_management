import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="page auth-page">
      <div className="auth-panel login-portal">
        <p className="brand-hero compact">
          Peniel <em>Evangelical Fellowship</em>
        </p>
        <h1>Choose your login</h1>
        <p className="muted">Separate portals for believers, pastors, and admins.</p>

        <div className="portal-cards three">
          <Link to="/login/believer" className="portal-card">
            <h2>Believer Login</h2>
            <p>Book home programs and share prayer requests.</p>
            <span className="text-link">Continue as believer →</span>
          </Link>
          <Link to="/login/pastor" className="portal-card pastor">
            <h2>Pastor Login</h2>
            <p>Approve bookings, prayers, and view calendar reminders.</p>
            <span className="text-link">Continue as pastor →</span>
          </Link>
          <Link to="/login/admin" className="portal-card admin">
            <h2>Admin Login</h2>
            <p>Upload pictures and monitor the whole website.</p>
            <span className="text-link">Continue as admin →</span>
          </Link>
        </div>

        <p className="auth-foot">
          New believer? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
