import React, { useEffect, useState } from 'react';
import { Check, Copy, MessageCircle, Phone, X } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import {
  buildWhatsAppStatusUpdateMessage,
  normalizeBrazilianPhoneForWa,
} from '../../utils/format';
import { StatusBadge } from '../StatusBadge';

interface WhatsAppStatusModalProps {
  order: Order | null;
  nextStatus: OrderStatus | null;
  storeName: string;
  onClose: () => void;
}

export const WhatsAppStatusModal: React.FC<WhatsAppStatusModalProps> = ({
  order,
  nextStatus,
  storeName,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order && nextStatus) {
      setMessage(buildWhatsAppStatusUpdateMessage(order, nextStatus, storeName));
      setCopied(false);
    }
  }, [order, nextStatus, storeName]);

  if (!order || !nextStatus) return null;

  const waPhone = normalizeBrazilianPhoneForWa(order.customerPhone);
  const waUrl = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`
    : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-status-title"
    >
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-400">
              Status do pedido {order.code} atualizado
            </p>
            <h3
              id="whatsapp-status-title"
              className="font-display font-bold text-xl text-white"
            >
              Avisar {order.customerName} no WhatsApp
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar envio de WhatsApp"
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <StatusBadge status={nextStatus} modality={order.modality} />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-200 tabular-nums">
            <Phone className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            {order.customerPhone}
          </span>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="whatsapp-status-message"
            className="block text-xs font-semibold text-slate-300"
          >
            Mensagem pronta para o cliente (você pode editar antes de abrir)
          </label>
          <textarea
            id="whatsapp-status-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          {!waUrl && (
            <p className="text-xs text-amber-300">
              O telefone cadastrado pelo cliente não possui DDD + número completo para link direto. Copie a mensagem abaixo para enviar manualmente.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Abrir WhatsApp do cliente</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-100 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-orange-400 shrink-0" aria-hidden="true" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-colors whitespace-nowrap"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
