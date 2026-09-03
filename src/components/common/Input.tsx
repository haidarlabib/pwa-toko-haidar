import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, prefixText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#33312E] mb-1 tracking-tight"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-lg flex shadow-2xs">
          {prefixText && (
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#D5D2C9] bg-[#F5F4EE] text-[#605D57] text-xs font-semibold select-none">
              {prefixText}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full text-xs sm:text-sm rounded-lg border border-[#D5D2C9] px-3 py-2 bg-[#FAF9F5] text-[#121214] placeholder-[#A8A49C] transition-all focus:bg-white focus:border-[#121214] focus:outline-none focus:ring-1 focus:ring-[#121214] disabled:bg-[#F5F4EE] disabled:text-[#85827B] ${
              prefixText ? 'rounded-l-none' : ''
            } ${error ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-[11px] text-rose-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-[11px] text-[#75726B]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
