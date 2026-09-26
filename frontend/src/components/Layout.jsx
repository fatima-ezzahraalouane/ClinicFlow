import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../api/labels';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="header">
        <span className="brand">ClinicFlow</span>
        <nav className="nav">
          <NavLink to="/" end>
            Tableau de bord
          </NavLink>
          <NavLink to="/patients">Patients</NavLink>
          <NavLink to="/appointments">Rendez-vous</NavLink>
        </nav>
        <div className="user">
          <span>{user.fullName}</span>
          <span className="role">{ROLE_LABELS[user.role]}</span>
          <button className="button secondary" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </>
  );
}
