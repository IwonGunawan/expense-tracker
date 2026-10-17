import { useEffect, useState } from 'react';
import { api, getUser, setUser } from '../api';
import { useI18n } from '../i18n';
import ConfirmModal from '../components/ConfirmModal';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';

export default function Settings() {
  const toast = useToast();
  const { t } = useI18n();
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
      toast.error(t('settings.pwMinError'));
      return;
    }
    if (newPw !== confirmPw) {
      toast.error(t('settings.pwMismatchError'));
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
      toast.success(t('settings.pwChanged'));
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
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="muted">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="panel">
        <h2>{t('settings.account')}</h2>
        <div className="account-row">
          <span className="avatar avatar-lg">{email?.[0]?.toUpperCase() ?? '?'}</span>
          <div>
            <p className="strong">{email || t('common.loading')}</p>
            <p className="muted">{t('settings.accountNote')}</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>{t('settings.changePassword')}</h2>
        <form onSubmit={changePassword} className="settings-form">
          <label className="field">
            <span className="field-label">{t('settings.currentPassword')}</span>
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
              <span className="field-label">{t('settings.newPassword')}</span>
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
              <span className="field-label">{t('settings.confirmNewPassword')}</span>
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
            {pwBusy ? t('common.saving') : t('settings.changePassword')}
          </button>
        </form>
      </div>

      <div className="panel panel-danger">
        <h2>{t('settings.dangerZone')}</h2>
        <p className="muted">{t('settings.dangerNote')}</p>
        <button
          type="button"
          className="btn-danger"
          onClick={() => setPendingDelete(true)}
        >
          <Icon name="trash" size={16} /> {t('settings.deleteAccount')}
        </button>
      </div>

      <ConfirmModal
        open={pendingDelete}
        title={t('settings.confirmTitle')}
        message={t('settings.confirmMsg')}
        confirmLabel={t('settings.deleteAccount')}
        danger
        busy={deleteBusy}
        onCancel={() => {
          setPendingDelete(false);
          setDeletePw('');
        }}
        onConfirm={deleteAccount}
      >
        <label className="field">
          <span className="field-label">{t('settings.password')}</span>
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