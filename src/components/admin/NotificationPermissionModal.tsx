import React from 'react';
import { BellRing, X } from 'lucide-react';

interface NotificationPermissionModalProps {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  open,
  onAllow,
  onDismiss,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-permission-title"
    >
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fechar aviso de notificações"
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3
            id="notif-permission-title"
            className="font-display font-bold text-xl text-white"
          >
            Ativar alertas de novos pedidos?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Precisamos da sua permissão no navegador para avisar imediatamente com alerta visual e sonoro quando um cliente enviar um novo pedido, mesmo que você esteja em outra aba ou janela.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ao clicar na notificação de um pedido recebido, o painel abrirá diretamente na aba <strong className="text-slate-200">Pedidos</strong>.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition-colors"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={onAllow}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-semibold transition-all shadow-lg shadow-orange-500/20"
          >
            Continuar e permitir
          </button>
        </div>
      </div>
    </div>
  );
};
