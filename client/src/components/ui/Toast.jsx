import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '../../store/uiStore';

const config = {
  success: { icon: CheckCircle2, ring: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: XCircle, ring: 'bg-red-50 text-red-600', bar: 'bg-red-500' },
  warning: { icon: TriangleAlert, ring: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
  info: { icon: Info, ring: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500' },
};

export default function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const dismiss = useUIStore((state) => state.dismissToast);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-2 px-3 sm:left-auto sm:right-4 sm:top-4 sm:items-end sm:px-0">
      {toasts.map((toast) => {
        const { icon: Icon, ring, bar } = config[toast.type] || config.info;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 pr-10 shadow-float animate-slide-in"
            role="status"
          >
            <span className={clsx('absolute inset-y-0 left-0 w-1', bar)} />
            <span className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', ring)}>
              <Icon size={17} />
            </span>
            <div className="min-w-0 pt-0.5">
              {toast.title ? (
                <p className="text-[13px] font-semibold text-slate-900">{toast.title}</p>
              ) : null}
              {toast.message ? (
                <p className="mt-0.5 break-words text-xs leading-5 text-slate-600">{toast.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="absolute right-2 top-2.5 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
