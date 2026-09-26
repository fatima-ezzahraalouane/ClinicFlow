import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="header">
        <span className="brand">ClinicFlow</span>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
        </nav>
        <div className="user">
          <span>{user.fullName}</span>
          <span className="role">{user.role}</span>
          <button className="button secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </>
  );
}
