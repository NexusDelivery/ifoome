import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react';
import { Order, StoreSettings } from '../../types';
import {
  buildWhatsAppOrderMessage,
  formatCurrency,
  formatOrderTime,
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
  const cleanPhone = store.phone.replace(/\D/g, '');
  const waMessage = encodeURIComponent(buildWhatsAppOrderMessage(order, store.name));
  const waUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#ECFDF3] text-[#027A48] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold text-[#027A48]">
            Pedido enviado para {store.name}
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#382B25]">
            Pedido {order.code} Recebido!
          </h1>
          <p className="text-sm text-[#6E5D55] max-w-md mx-auto">
            Obrigado, <strong>{order.customerName}</strong>! Seu pedido foi registrado às{' '}
            <span className="tabular-nums font-semibold">
              {formatOrderTime(order.createdAt)}
            </span>{' '}
            e já aparece no painel da cozinha.
          </p>
          <div className="flex justify-center pt-1">
            <StatusBadge status={order.status} modality={order.modality} />
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="border-t border-b border-[#EAE0D5] py-4 space-y-3">
          <p className="text-xs font-semibold text-[#6E5D55]">Resumo dos itens</p>
          <ul className="space-y-2 text-sm">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between gap-3">
                <div>
                  <span className="font-semibold text-[#382B25]">
                    {item.quantity}x {item.name}
                  </span>
                  {item.observation && (
                    <p className="text-xs text-[#6E5D55]">Obs: {item.observation}</p>
                  )}
                </div>
                <span className="tabular-nums font-semibold text-[#382B25]">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-[#F2EAE0] space-y-1.5 text-sm">
            <div className="flex justify-between text-[#6E5D55]">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6E5D55]">
              <span>Taxa de entrega</span>
              <span className="tabular-nums">
                {order.deliveryFee === 0 ? 'Grátis' : formatCurrency(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between font-display font-bold text-lg text-[#382B25] pt-1.5">
              <span>Total</span>
              <span className="tabular-nums text-[#D94B3D]">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Entrega e Pagamento */}
        <div className="space-y-2 text-sm text-[#6E5D55]">
          {order.modality === 'entrega' && order.address ? (
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#F47B35] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong className="text-[#382B25]">Entrega:</strong> {order.address.street},{' '}
                {order.address.number} — {order.address.neighborhood}
                {order.address.complement ? ` (${order.address.complement})` : ''}
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <ShoppingBag className="w-4 h-4 text-[#F47B35] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong className="text-[#382B25]">Retirada no local:</strong> {store.address}
              </span>
            </p>
          )}
          <p>
            <strong className="text-[#382B25]">Pagamento:</strong> {order.paymentMethod}
            {order.paymentMethod === 'Dinheiro' && order.changeFor
              ? ` (troco para ${formatCurrency(order.changeFor)})`
              : ''}
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[48px] px-4 py-3 rounded-xl bg-[#027A48] hover:bg-[#05603A] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Enviar resumo no WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onBackToMenu}
            className="flex-1 min-h-[48px] px-4 py-3 rounded-xl border border-[#DDD2C6] text-sm font-semibold text-[#382B25] hover:bg-[#FFF8EF] flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Fazer novo pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
