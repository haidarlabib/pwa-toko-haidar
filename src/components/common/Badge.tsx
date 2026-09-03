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
    default: 'bg-[#F5F4EE] text-[#121214] border-[#E5E2DA]',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    neutral: 'bg-[#FAF9F5] text-[#605D57] border-[#E5E2DA]',
    version: 'bg-[#F0EFE9] text-[#121214] border-[#E5E2DA] font-mono font-bold tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border font-medium tracking-tight ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
