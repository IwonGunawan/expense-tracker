import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Icon from './Icon';

const ToastCtx = createContext(null);
export function useToast() {
  return useContext(ToastCtx);
}

const ICONS = { success: 'check', error: 'alert', info: 'alert' };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list, { id, type, message }]);
      setTimeout(() => remove(id), 3200);
    },
    [remove],
  );

  const value = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-viewport">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-icon">
              <Icon name={ICONS[t.type] ?? 'alert'} size={16} />
            </span>
            <span className="toast-msg">{t.message}</span>
            <button
              className="toast-close"
              onClick={() => remove(t.id)}
              aria-label="Tutup"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}