import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  MapPin,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react';
import { Order, StoreSettings } from '../../types';
import {
  buildWhatsAppOrderMessage,
  formatCurrency,
  formatOrderTime,
  normalizeBrazilianPhoneForWa,
} from '../../utils/format';
import { StatusBadge } from '../StatusBadge';

interface OrderConfirmationViewProps {
  order: Order;
  store: StoreSettings;
  onBackToMenu: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  store,
  onBackToMenu,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedMessage = buildWhatsAppOrderMessage(order, store.name);
  const waPhone = normalizeBrazilianPhoneForWa(store.phone);
  const waUrl = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(formattedMessage)}`
    : null;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback simples se clipboard API não estiver disponível
      setCopied(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="bg-slate-900 rounded-3xl border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
            <Check className="w-10 h-10" strokeWidth={3} aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold text-emerald-400">
            Pedido registrado no sistema de {store.name}
          </p>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Pedido {order.code} Recebido!
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Obrigado, <strong className="text-white">{order.customerName}</strong>! O restaurante já está preparando o seu pedido registrado às{' '}
            <span className="tabular-nums font-semibold text-white">
              {formatOrderTime(order.createdAt)}
            </span>
            .
          </p>
          <div className="flex justify-center pt-1">
            <StatusBadge status={order.status} modality={order.modality} />
          </div>
        </div>

        {/* Caixa de Protocolo e Estimativa (inspirada no modal Nexus) */}
        <div className="bg-slate-800/80 rounded-2xl p-4 text-xs border border-slate-700/60 space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Número do Pedido:</span>
            <span className="font-mono text-white font-bold">{order.code}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Estimativa:</span>
            <span className="text-orange-400 font-semibold">{store.deliveryEstimate}</span>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="border-t border-b border-slate-800 py-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Resumo dos itens
          </p>
          <ul className="space-y-2 text-sm">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between gap-3">
                <div>
                  <span className="font-semibold text-white">
                    {item.quantity}x {item.name}
                  </span>
                  {item.observation && (
                    <p className="text-xs text-slate-400">Obs: {item.observation}</p>
                  )}
                </div>
                <span className="tabular-nums font-semibold text-slate-200">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="tabular-nums text-slate-200">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxa de entrega</span>
              <span className="tabular-nums text-emerald-400 font-semibold">
                {order.deliveryFee === 0 ? 'Grátis' : formatCurrency(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between font-display font-bold text-lg text-white pt-1.5">
              <span>Total</span>
              <span className="tabular-nums text-orange-400">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Entrega e Pagamento */}
        <div className="space-y-2 text-sm text-slate-300">
          {order.modality === 'entrega' && order.address ? (
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong className="text-white">Entrega:</strong> {order.address.street},{' '}
                {order.address.number} — {order.address.neighborhood}
                {order.address.complement ? ` (${order.address.complement})` : ''}
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong className="text-white">Retirada no local:</strong> {store.address}
              </span>
            </p>
          )}
          <p>
            <strong className="text-white">Pagamento:</strong> {order.paymentMethod}
            {order.paymentMethod === 'Dinheiro' && order.changeFor
              ? ` (troco para ${formatCurrency(order.changeFor)})`
              : ''}
          </p>
          {order.generalObservation && (
            <p>
              <strong className="text-white">Observações:</strong>{' '}
              {order.generalObservation}
            </p>
          )}
        </div>

        {/* Encaminhamento via WhatsApp */}
        <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              Encaminhar pedido pelo WhatsApp (opcional)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {waUrl
                ? `Clique abaixo para abrir o WhatsApp do restaurante (${store.phone}) com a mensagem pronta. O envio só acontece após você confirmar dentro do WhatsApp.`
                : 'O restaurante ainda não cadastrou um número de WhatsApp comercial. Você pode copiar o resumo abaixo se precisar.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Abrir WhatsApp com pedido</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyMessage}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Mensagem copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-orange-400 shrink-0" aria-hidden="true" />
                  <span>Copiar resumo</span>
                </>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-orange-500/20"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Fazer Outro Pedido</span>
        </button>
      </div>
    </div>
  );
};
