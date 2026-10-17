import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, getToken, setToken, setUser } from '../api';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';
import Illustration from '../components/Illustration';
import Logo from '../components/Logo';

const POINTS = [
  'Catat pengeluaran harian dalam hitungan detik',
  'Rekap otomatis per kategori dan per bulan',
  'Grafik tren 12 bulan untuk pantau kebiasaanmu',
];

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
      const data = await api(path, {
        method: 'POST',
        body: { email: email.trim(), password },
      });
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
      <div className="auth-split">
        <aside className="auth-aside">
          <div className="auth-aside-inner">
            <Logo size={40} withText />
            <h2>Kelola pengeluaran dengan rapi dan terukur.</h2>
            <p>Semua catatan keuanganmu dalam satu dashboard yang bersih.</p>

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

            <Illustration className="auth-illustration" />
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-head">
            <Logo size={46} />
            <h1>{mode === 'login' ? 'Masuk ke akunmu' : 'Buat akun baru'}</h1>
            <p className="muted">
              {mode === 'login'
                ? 'Lanjutkan catat pengeluaranmu.'
                : 'Mulai gratis, tanpa kartu kredit.'}
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

            <button type="submit" className="btn-primary auth-submit" disabled={busy}>
              {busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button
              type="button"
              className="link auth-link"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </button>
          </p>

          <p className="auth-trust">
            <Icon name="check" size={13} /> Data tersimpan aman di server kamu sendiri
          </p>
        </div>
      </div>
    </div>
  );
}