import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const variants = {
  primary:
    'bg-forest-800 text-white shadow-soft hover:bg-forest-900 active:translate-y-px',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:translate-y-px',
  soft: 'border border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:translate-y-px',
  outline: 'border border-forest-700/20 bg-transparent text-forest-800 hover:bg-forest-50',
  white: 'bg-white text-forest-900 shadow-sm hover:bg-emerald-50',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-[13px]',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
  icon: 'h-9 w-9 p-0',
  iconSm: 'h-8 w-8 p-0',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
