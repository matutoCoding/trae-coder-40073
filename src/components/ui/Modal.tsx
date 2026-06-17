import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string | number;
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
}

const Modal = ({
  open,
  title,
  onClose,
  children,
  footer,
  width = 'max-w-2xl',
  closable = true,
  maskClosable = true,
  className,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, closable, onClose]);

  if (!open) return null;

  const content = (
    <div
      className="modal-backdrop"
      onClick={() => maskClosable && closable && onClose()}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'modal-dialog',
          typeof width === 'number' ? '' : width,
          className
        )}
        style={typeof width === 'number' ? { width: `${width}px`, maxWidth: '95vw' } : undefined}
      >
        {(title || closable) && (
          <div className="modal-header">
            <div className="text-base font-semibold text-neutral-800">{title}</div>
            {closable && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {children && <div className="modal-body">{children}</div>}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default Modal;
