import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';

export default function Groups() {
  const { t } = useI18n();
  const toast = useToast();
  const [myGroup, setMyGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [busy, setBusy] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [group, inv] = await Promise.all([api('/groups/me'), api('/groups/invites')]);
      setMyGroup(group);
      setInvites(inv);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    if (groupName.trim().length < 3) return toast.error('Nama grup minimal 3 karakter');
    setBusy(true);
    try {
      await api('/groups', { method: 'POST', body: { name: groupName.trim() } });
      toast.success('Grup berhasil dibuat');
      setGroupName('');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const invite = async (e) => {
    e.preventDefault();
    if (inviteUsername.trim().length < 3) return toast.error('Username minimal 3 karakter');
    setBusy(true);
    try {
      const res = await api('/groups/invite', { method: 'POST', body: { username: inviteUsername.trim() } });
      setInviteCode(res.code);
      toast.success('Undangan berhasil dibuat');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const join = async (e) => {
    e.preventDefault();
    if (joinCode.trim().length < 6) return toast.error('Kode undangan minimal 6 karakter');
    setBusy(true);
    try {
      await api('/groups/join', { method: 'POST', body: { code: joinCode.trim() } });
      toast.success('Berhasil bergabung ke grup');
      setJoinCode('');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (!confirm('Keluar dari grup?')) return;
    setBusy(true);
    try {
      await api('/groups/me', { method: 'DELETE' });
      toast.success('Berhasil keluar grup');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page-head">
        <h1 className="page-title">Grup</h1>
        <p className="muted">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Grup</h1>
          <p className="muted">1 keluarga bisa gabung, lihat pengeluaran bersama</p>
        </div>
      </div>

      {myGroup ? (
        <div className="panel">
          <h2>{myGroup.name}</h2>
          <p className="muted">Sudah tergabung dalam grup</p>
          <button type="button" className="btn-danger" onClick={leave} disabled={busy}>
            <Icon name="logout" size={16} /> Keluar Grup
          </button>
        </div>
      ) : (
        <div className="panel">
          <h2>Buat Grup Baru</h2>
          <form onSubmit={createGroup} className="settings-form">
            <label className="field">
              <span className="field-label">Nama Grup</span>
              <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} minLength={3} maxLength={50} required />
            </label>
            <button type="submit" disabled={busy}>Buat Grup</button>
          </form>

          <h2 style={{ marginTop: 24 }}>Gabung ke Grup</h2>
          <form onSubmit={join} className="settings-form">
            <label className="field">
              <span className="field-label">Kode Undangan</span>
              <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} minLength={6} required />
            </label>
            <button type="submit" disabled={busy}>Gabung</button>
          </form>
        </div>
      )}

      {myGroup && (
        <div className="panel">
          <h2>Undang Anggota</h2>
          <form onSubmit={invite} className="settings-form">
            <label className="field">
              <span className="field-label">Username</span>
              <input type="text" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} minLength={3} required />
            </label>
            <button type="submit" disabled={busy}>Buat Kode Undangan</button>
          </form>
          {inviteCode && (
            <div style={{ marginTop: 16, padding: 12, background: '#f7faf9', border: '1px solid #e3e9e6', borderRadius: 10 }}>
              <p className="muted">Kode undangan:</p>
              <p className="strong" style={{ fontSize: 18, letterSpacing: 2 }}>{inviteCode}</p>
            </div>
          )}
          {invites.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>Undangan Pending</h3>
              <ul>
                {invites.map((inv) => (
                  <li key={inv.id}>{inv.invitedUsername} (kode: {inv.code})</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}
