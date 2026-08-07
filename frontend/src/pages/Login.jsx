import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="page auth-page">
      <div className="auth-panel login-portal">
        <p className="brand-hero compact">
          Peniel <em>Evangelical Fellowship</em>
        </p>
        <h1>Choose your login</h1>
        <p className="muted">Pastors and believers have separate sign-in portals.</p>

        <div className="portal-cards">
          <Link to="/login/believer" className="portal-card">
            <h2>Believer Login</h2>
            <p>Request home programs, track approvals, and join prayer.</p>
            <span className="text-link">Continue as believer →</span>
          </Link>
          <Link to="/login/pastor" className="portal-card pastor">
            <h2>Pastor Login</h2>
            <p>Accept home program slots and view weekly notifications.</p>
            <span className="text-link">Continue as pastor →</span>
          </Link>
        </div>

        <p className="auth-foot">
          New believer? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
