import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 3500);
  }, [dismissToast]);

  const confirmDialog = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        resolve: (value) => {
          setConfirmState(null);
          resolve(value);
        }
      });
    });
  }, []);

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <XCircle size={18} className="text-red-600 dark:text-red-400 shrink-0" />,
    info: <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
  };

  return (
    <ToastContext.Provider value={{ toast, confirm: confirmDialog }}>
      {children}

      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg shadow-gray-200/60 dark:shadow-black/40 animate-[fadeUp_0.25s_ease-out]"
          >
            {icons[t.type] || icons.info}
            <p className="flex-1 text-xs font-semibold text-gray-800 dark:text-neutral-200 leading-relaxed">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => confirmState.resolve(false)}
          />
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-start gap-3 mb-5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${confirmState.danger ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300'}`}>
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{confirmState.title || 'Are you sure?'}</h3>
                {confirmState.message && (
                  <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">{confirmState.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => confirmState.resolve(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {confirmState.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => confirmState.resolve(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors ${confirmState.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200'}`}
              >
                {confirmState.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};
