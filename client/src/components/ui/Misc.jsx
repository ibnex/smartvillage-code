import clsx from 'clsx';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { initials } from '../../lib/format';
import Button from './Button';

export function Avatar({ name, size = 'md', className }) {
  const sizes = {
    xs: 'h-7 w-7 text-[10px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-lg',
  };
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-700 to-forest-900 font-semibold tracking-wide text-emerald-50 ring-2 ring-white/70',
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Spinner({ size = 18, className }) {
  return <Loader2 size={size} className={clsx('animate-spin text-emerald-600', className)} aria-hidden="true" />;
}

export function PageLoader({ label = 'Loading your dashboard…' }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4" role="status">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-800 shadow-soft">
        <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
          <path
            d="M45 18c-10-.5-19 4.8-21 13.8-1.1 5 .8 9.6 4.5 12.2 5.4-1 10.1-4 13.2-8.5C45.3 30.4 46.1 24 45 18Z"
            fill="#A7F3D0"
          />
          <path d="M21.5 45c2.5-9 8.2-15.5 17.2-19.5" stroke="#132A1E" strokeWidth="2.7" strokeLinecap="round" />
        </svg>
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
          <Loader2 size={14} className="animate-spin text-emerald-600" />
        </span>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <Icon size={24} />
      </div>
      <h3 className="font-display text-base font-semibold text-slate-800">{title}</h3>
      {message ? <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry, title = 'Unable to load this view' }) {
  return (
    <div className="surface-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
        <AlertCircle size={25} />
      </div>
      <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw size={14} /> Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />;
}

export function Pagination({ meta, onPageChange, className }) {
  if (!meta) return null;
  const { page = 1, totalPages = 1, total = 0, limit = 10 } = meta;
  if (total === 0) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className={clsx('flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row', className)}>
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{start}</span>–
        <span className="font-semibold text-slate-700">{end}</span> of{' '}
        <span className="font-semibold text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="px-2 text-xs font-semibold text-slate-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export function InlineAlert({ tone = 'error', title, children, className }) {
  const tones = {
    error: { wrap: 'border-red-200 bg-red-50 text-red-800', icon: XCircle, iconClass: 'text-red-500' },
    warning: { wrap: 'border-amber-200 bg-amber-50 text-amber-800', icon: AlertCircle, iconClass: 'text-amber-500' },
    success: { wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2, iconClass: 'text-emerald-500' },
    info: { wrap: 'border-blue-200 bg-blue-50 text-blue-800', icon: AlertCircle, iconClass: 'text-blue-500' },
  };
  const config = tones[tone] || tones.error;
  const Icon = config.icon;
  return (
    <div className={clsx('flex gap-3 rounded-xl border p-3.5 text-sm', config.wrap, className)} role="alert">
      <Icon size={17} className={clsx('mt-0.5 shrink-0', config.iconClass)} />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={clsx('leading-5', title && 'mt-0.5')}>{children}</div> : null}
      </div>
    </div>
  );
}
