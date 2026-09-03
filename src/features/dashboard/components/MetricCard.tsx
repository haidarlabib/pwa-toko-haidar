import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  variant?: 'default' | 'danger' | 'warning' | 'emerald';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200 text-slate-900',
    danger: 'bg-red-50/50 border-red-200 text-red-900',
    warning: 'bg-amber-50/50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50/50 border-emerald-200 text-emerald-900',
  };

  const iconColors = {
    default: 'text-slate-500 bg-slate-100',
    danger: 'text-red-600 bg-red-100',
    warning: 'text-amber-600 bg-amber-100',
    emerald: 'text-emerald-600 bg-emerald-100',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border shadow-2xs transition-all flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs active:scale-[0.99]' : ''
      } ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-black tracking-tight">{value}</div>
        {subtext && <div className="text-xs text-slate-500 mt-0.5">{subtext}</div>}
      </div>
    </div>
  );
};
