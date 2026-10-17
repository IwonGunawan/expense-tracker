import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, getToken, setToken, setUser } from '../api';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';

export default function Login() {
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  if (getToken()) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (email.trim() === '' || password.length < 6) {
      toast.error('Periksa email dan password (minimal 6 karakter).');
      return;
    }
    setBusy(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const data = await api(path, { method: 'POST', body: { email: email.trim(), password } });
      setToken(data.token);
      setUser(data.user);
      window.location.href = '/';
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head">
          <span className="brand-logo brand-lg">ET</span>
          <h1>Expense Tracker</h1>
          <p className="muted">
            {mode === 'login' ? 'Masuk untuk lanjutkan.' : 'Buat akun baru, siap mencatat pengeluaran.'}
          </p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <span className="password-field">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
              <button
                type="button"
                className="ghost password-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                <Icon name={showPw ? 'close' : 'check'} size={16} />
              </button>
            </span>
          </label>

          <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
            {busy ? 'Proses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button
            type="button"
            className="link auth-link"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  );
}