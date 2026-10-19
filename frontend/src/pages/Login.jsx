import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, getToken, setToken, setUser } from '../api';
import { LangSwitch, useI18n } from '../i18n';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';
import Illustration from '../components/Illustration';
import Logo from '../components/Logo';

export default function Login() {
  const toast = useToast();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('login');

  if (getToken()) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (username.trim().length < 3 || password.length < 6) {
      toast.error(t('login.error'));
      return;
    }
    setBusy(true);
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const data = await api(endpoint, {
        method: 'POST',
        body: { username: username.trim(), password },
      });
      setToken(data.token);
      setUser(data.user);
      window.location.href = '/';
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  const POINTS = [t('login.point1'), t('login.point2'), t('login.point3')];

  return (
    <div className="auth-shell">
      <LangSwitch className="auth-lang" />
      <div className="auth-split">
        <aside className="auth-aside">
          <div className="auth-aside-inner">
            <Logo size={40} withText />
            <h2>{t('login.asideTitle')}</h2>
            <p>{t('login.asideText')}</p>

            <ul className="auth-points">
              {POINTS.map((text) => (
                <li key={text}>
                  <span className="auth-point-icon">
                    <Icon name="check" size={14} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <Illustration className="auth-illustration" label={t('login.illustrationAria')} />
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-head">
            <Logo size={46} />
            <h1>{mode === 'register' ? t('login.registerTitle') : t('login.signInTitle')}</h1>
            <p className="muted">{mode === 'register' ? t('login.registerSub') : t('login.signInSub')}</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <label className="field">
              <span className="field-label">{t('login.username')}</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.usernamePlaceholder')}
                autoComplete="username"
                required
                minLength={3}
              />
            </label>

            <label className="field">
              <span className="field-label">{t('login.password')}</span>
              <span className="password-field">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.pwPlaceholder')}
                  autoComplete="current-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="ghost password-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? t('login.hidePw') : t('login.showPw')}
                >
                  <Icon name={showPw ? 'eye-off' : 'eye'} size={18} />
                </button>
              </span>
            </label>

            <button type="submit" className="btn-primary auth-submit" disabled={busy}>
              {busy ? t('login.processing') : mode === 'register' ? t('login.register') : t('login.signIn')}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? (
              <>
                {t('login.noAccount')}{' '}
                <button type="button" className="link auth-link" onClick={() => setMode('register')}>
                  {t('login.register')}
                </button>
              </>
            ) : (
              <>
                {t('login.haveAccount')}{' '}
                <button type="button" className="link auth-link" onClick={() => setMode('login')}>
                  {t('login.signIn')}
                </button>
              </>
            )}
          </p>

          <p className="auth-trust">
            <Icon name="check" size={13} /> {t('login.trust')}
          </p>
        </div>
      </div>
    </div>
  );
}