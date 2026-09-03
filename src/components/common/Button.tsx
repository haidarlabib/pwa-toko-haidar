import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#121214] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 min-h-[46px]',
  };

  const variants = {
    primary: 'bg-[#121214] hover:bg-[#2A2A2E] text-white shadow-xs',
    secondary: 'bg-[#F5F4EE] hover:bg-[#EAE8E0] text-[#121214] border border-[#E5E2DA]',
    outline: 'border border-[#D5D2C9] bg-white hover:bg-[#FAF9F5] text-[#121214]',
    ghost: 'bg-transparent hover:bg-[#F5F4EE] text-[#605D57] hover:text-[#121214]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    success: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
