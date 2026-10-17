import { useI18n } from '../i18n';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
  children,
}) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        {message && <p className="muted">{message}</p>}
        {children && <div className="modal-body">{children}</div>}
        <div className="modal-actions">
          <button className="ghost" onClick={onCancel} disabled={busy}>
            {t('common.cancel')}
          </button>
          <button
            className={danger ? 'btn-danger' : ''}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? t('common.processing') : confirmLabel ?? t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}