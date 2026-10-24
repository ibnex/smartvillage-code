import clsx from 'clsx';
import { clampPercent } from '../../lib/format';

const barColors = {
  emerald: 'bg-emerald-500',
  forest: 'bg-forest-700',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
};

export default function ProgressBar({
  value = 0,
  color = 'emerald',
  size = 'md',
  className,
  showLabel = false,
  labelClassName,
}) {
  const percent = clampPercent(value);
  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };

  return (
    <div className={clsx('flex items-center gap-2.5', className)}>
      <div
        className={clsx('flex-1 overflow-hidden rounded-full bg-slate-100', heights[size])}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-700 ease-out', barColors[color] || barColors.emerald)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel ? (
        <span className={clsx('w-9 shrink-0 text-right text-xs font-semibold text-slate-600', labelClassName)}>
          {percent}%
        </span>
      ) : null}
    </div>
  );
}
