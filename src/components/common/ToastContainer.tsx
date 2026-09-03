import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg shadow-lg border text-sm transition-all transform animate-in slide-in-from-top duration-200 ${
            t.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-800'
              : t.type === 'error'
              ? 'bg-red-900 text-white border-red-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="font-medium text-xs leading-relaxed">{t.message}</span>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/70 hover:text-white p-1 rounded transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
