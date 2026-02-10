import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'danger' | 'primary';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  loadingText,
  variant = 'danger',
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) {
    return null;
  }

  const confirmClassName =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400'
      : 'bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-60';

  const dialogContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={() => {
          if (!isLoading) {
            onCancel();
          }
        }}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <i className="fas fa-triangle-exclamation text-sm" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          </div>
          {description && <p className="pl-13 text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${confirmClassName}`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <i className="fas fa-circle-notch fa-spin" />
                {loadingText || confirmText}
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(dialogContent, document.body);
};

export default ConfirmDialog;
