import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken, clearUser, getUser } from '../api';
import { useI18n, LangSwitch } from '../i18n';
import { initialOf } from '../utils';
import Icon from './Icon';
import Logo from './Logo';

function ProfileMenu({ email, onLogout }) {
  const { t } = useI18n();
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
        aria-label={t('profile.aria')}
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
            <Icon name="logout" size={16} /> {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { t } = useI18n();
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

  const LINKS = [
    { to: '/', label: t('nav.dashboard'), icon: 'dashboard', end: true },
    { to: '/expenses', label: t('nav.expenses'), icon: 'wallet' },
    { to: '/categories', label: t('nav.categories'), icon: 'tag' },
    { to: '/settings', label: t('nav.settings'), icon: 'settings' },
  ];

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <Logo size={36} withText subtitle={t('logo.tagline')} />
        </div>

        <nav className="topbar-nav" aria-label={t('nav.aria')}>
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

        <LangSwitch />
        <ProfileMenu email={email} onLogout={logout} />
      </header>

      <main className="shell-main">
        <div className="content">
          <Outlet />
        </div>
      </main>

      <nav className="bottom-nav" aria-label={t('nav.bottomAria')}>
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
