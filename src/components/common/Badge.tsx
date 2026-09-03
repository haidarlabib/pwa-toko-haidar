import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'neutral' | 'version';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    version: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-mono font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium tracking-tight ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
