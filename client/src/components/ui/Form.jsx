import { forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export function Field({ label, htmlFor, required, error, hint, children, className }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className="label-base">
          {label}
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
      {!error && hint ? <p className="helper-text">{hint}</p> : null}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { className, icon: Icon, error, suffix, ...props },
  ref
) {
  return (
    <div className="relative">
      {Icon ? (
        <Icon
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      ) : null}
      <input
        ref={ref}
        className={clsx(
          'field-base',
          Icon && 'pl-10',
          suffix && 'pr-20',
          error && 'border-red-300 focus:border-red-400 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
      {suffix ? (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{suffix}</div>
      ) : null}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        'field-base min-h-[104px] resize-y leading-relaxed',
        error && 'border-red-300 focus:border-red-400 focus:ring-red-500/10',
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select(
  { className, error, children, placeholder, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={clsx('field-base appearance-none pr-10', error && 'border-red-300', className)}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
});

export function SearchField({ value, onChange, placeholder = 'Search…', className, onClear }) {
  return (
    <div className={clsx('relative', className)}>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 3.5 3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="field-base pl-10 pr-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
