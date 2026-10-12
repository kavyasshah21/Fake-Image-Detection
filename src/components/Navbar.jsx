import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/deepfake-logo.svg" alt="Logo" className="navbar-logo" />
        <span>Deepfake Detection</span>
      </div>
      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
        >
          History
        </NavLink>
      </div>
      <div className="navbar-user">
        {user && (
          <span className="navbar-user-name">{user.name || user.email}</span>
        )}
        <button onClick={handleLogout} className="navbar-logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
