import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#121214]/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidths[maxWidth]} bg-white rounded-t-2xl sm:rounded-2xl border border-[#E5E2DA] shadow-xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transition-all transform animate-in slide-in-from-bottom-2 sm:zoom-in-95 duration-150 font-sans`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#EAE8E2] bg-[#FAF9F5]">
          <div>
            <h3 className="text-base font-bold text-[#121214] leading-snug tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#75726B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#85827B] hover:text-[#121214] hover:bg-[#EAE8E2] p-1.5 rounded-lg transition-colors ml-4 -mr-1.5 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#33312E]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#EAE8E2] bg-[#FAF9F5]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
