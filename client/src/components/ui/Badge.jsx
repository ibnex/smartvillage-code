import clsx from 'clsx';
import {
  PROJECT_STATUS_STYLES,
  COMPLAINT_STATUS_STYLES,
  CATEGORY_STYLES,
} from '../../lib/constants';

export default function Badge({ children, className, color = 'slate', dot = false }) {
  const colors = {
    slate: 'border-slate-200 bg-slate-100 text-slate-600',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    white: 'border-white/20 bg-white/10 text-white',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
        colors[color],
        className
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status, kind = 'project', className }) {
  const styles =
    (kind === 'complaint' ? COMPLAINT_STATUS_STYLES : PROJECT_STATUS_STYLES)[status] ||
    PROJECT_STATUS_STYLES.Planned;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
        styles.badge,
        className
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {status}
    </span>
  );
}

export function CategoryBadge({ category, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
        CATEGORY_STYLES[category] || 'border-slate-200 bg-slate-100 text-slate-600',
        className
      )}
    >
      {category}
    </span>
  );
}
