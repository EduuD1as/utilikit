import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from './PreferencesContext.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback((message, tone = 'ok') => {
    clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de ToastProvider');
  return ctx;
}

/** Copia texto para a área de transferência e avisa com um toast. */
export function useCopy() {
  const toast = useToast();
  const t = useT();
  return useCallback(
    async (text, message) => {
      if (text == null || text === '') return false;
      try {
        await navigator.clipboard.writeText(String(text));
        toast(message || t('common.copied'));
        return true;
      } catch {
        toast(t('common.copyFailed'), 'error');
        return false;
      }
    },
    [toast, t]
  );
}
