import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full font-sans">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#33312E] mb-1 tracking-tight"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full text-xs sm:text-sm rounded-lg border border-[#D5D2C9] px-3 py-2 bg-[#FAF9F5] text-[#121214] transition-all focus:bg-white focus:border-[#121214] focus:outline-none focus:ring-1 focus:ring-[#121214] disabled:bg-[#F5F4EE] disabled:text-[#85827B] shadow-2xs ${
            error ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-[11px] text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
