import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken, clearUser, getUser } from '../api';
import { initialOf } from '../utils';
import Icon from './Icon';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/expenses', label: 'Pengeluaran', icon: 'wallet' },
  { to: '/categories', label: 'Kategori', icon: 'tag' },
  { to: '/settings', label: 'Pengaturan', icon: 'settings' },
];

function ProfileMenu({ email, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="profile-menu" ref={ref}>
      <button
        type="button"
        className="avatar profile-trigger"
        aria-label="Menu profil"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {initialOf(email)}
      </button>
      {open && (
        <div className="dropdown">
          <span className="dropdown-email">{email ?? '—'}</span>
          <button
            type="button"
            className="dropdown-item"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <Icon name="logout" size={16} /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    setEmail(getUser()?.email ?? null);
  }, []);

  const logout = () => {
    clearToken();
    clearUser();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <span className="brand-logo">ET</span>
          <span className="brand-text">Expense Tracker</span>
        </div>

        <nav className="topbar-nav" aria-label="Navigasi">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <ProfileMenu email={email} onLogout={logout} />
      </header>

      <main className="shell-main">
        <div className="content">
          <Outlet />
        </div>
      </main>

      <nav className="bottom-nav" aria-label="Navigasi bawah">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => 'bottom-link' + (isActive ? ' active' : '')}
          >
            <Icon name={link.icon} size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}