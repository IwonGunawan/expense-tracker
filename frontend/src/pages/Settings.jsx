import { useEffect, useState } from 'react';
import { api, getUser, setUser } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';

export default function Settings() {
  const toast = useToast();
  const [email, setEmail] = useState(getUser()?.email ?? '');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then((data) => {
        setEmail(data.email);
        setUser(data);
      })
      .catch((e) => toast.error(e.message));
  }, [toast]);

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setPwBusy(true);
    try {
      await api('/auth/me/password', {
        method: 'PATCH',
        body: { currentPassword: currentPw, newPassword: newPw },
      });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      toast.success('Password diganti');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!deletePw) return;
    setDeleteBusy(true);
    try {
      await api('/auth/me', {
        method: 'DELETE',
        body: { password: deletePw },
      });
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.message);
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="muted">Kelola akun dan keamanan.</p>
        </div>
      </div>

      <div className="panel">
        <h2>Akun</h2>
        <div className="account-row">
          <span className="avatar avatar-lg">{email?.[0]?.toUpperCase() ?? '?'}</span>
          <div>
            <p className="strong">{email || 'Memuat...'}</p>
            <p className="muted">Email terdaftar akun ini.</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Ganti Password</h2>
        <form onSubmit={changePassword} className="settings-form">
          <label className="field">
            <span className="field-label">Password saat ini</span>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <div className="settings-row">
            <label className="field">
              <span className="field-label">Password baru</span>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </label>
            <label className="field">
              <span className="field-label">Konfirmasi password baru</span>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          </div>
          <button type="submit" disabled={pwBusy}>
            {pwBusy ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </div>

      <div className="panel panel-danger">
        <h2>Danger Zone</h2>
        <p className="muted">Hapus akun beserta seluruh data secara permanen.</p>
        <button
          type="button"
          className="btn-danger"
          onClick={() => setPendingDelete(true)}
        >
          <Icon name="trash" size={16} /> Hapus Akun
        </button>
      </div>

      <ConfirmModal
        open={pendingDelete}
        title="Hapus akun?"
        message="Semua pengeluaran dan kategori akan hilang permanen. Masukkan password untuk konfirmasi."
        confirmLabel="Hapus Akun"
        danger
        busy={deleteBusy}
        onCancel={() => {
          setPendingDelete(false);
          setDeletePw('');
        }}
        onConfirm={deleteAccount}
      >
        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            value={deletePw}
            onChange={(e) => setDeletePw(e.target.value)}
            autoFocus
            required
          />
        </label>
      </ConfirmModal>
    </>
  );
}