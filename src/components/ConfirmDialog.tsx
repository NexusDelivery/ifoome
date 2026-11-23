import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Voltar',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full sm:max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-700 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                destructive
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
              }`}
            >
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3
              id="confirm-dialog-title"
              className="font-display font-bold text-lg text-white"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar confirmação"
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">{description}</p>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors whitespace-nowrap ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
