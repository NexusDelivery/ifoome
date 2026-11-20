import { DeliveryType, Order, OrderStatus } from '../types';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

export function getDigitsCount(value: string): number {
  return value.replace(/\D/g, '').length;
}

export function isSameLocalDay(isoString: string, reference = new Date()): boolean {
  const d = new Date(isoString);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

export function getDisplayOrderStatus(
  status: OrderStatus,
  deliveryType: DeliveryType
): string {
  if (status === 'Saiu para entrega' && deliveryType === 'Retirada') {
    return 'Pronto para retirada';
  }
  return status;
}

export function getNextOrderAction(
  status: OrderStatus,
  deliveryType: DeliveryType
): { nextStatus: OrderStatus; label: string } | null {
  switch (status) {
    case 'Recebido':
      return { nextStatus: 'Em preparo', label: 'Iniciar preparo' };
    case 'Em preparo':
      return {
        nextStatus: 'Saiu para entrega',
        label:
          deliveryType === 'Retirada'
            ? 'Marcar pronto para retirada'
            : 'Enviar para entrega',
      };
    case 'Saiu para entrega':
      return { nextStatus: 'Concluído', label: 'Concluir pedido' };
    default:
      return null;
  }
}

export function getStatusVisualStyle(status: OrderStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Recebido':
      return {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#92400E]',
        border: 'border-[#FDE68A]',
      };
    case 'Em preparo':
      return {
        bg: 'bg-[#DBEAFE]',
        text: 'text-[#1E40AF]',
        border: 'border-[#BFDBFE]',
      };
    case 'Saiu para entrega':
      return {
        bg: 'bg-[#EDE9FE]',
        text: 'text-[#5B21B6]',
        border: 'border-[#DDD6FE]',
      };
    case 'Concluído':
      return {
        bg: 'bg-[#DCFCE7]',
        text: 'text-[#166534]',
        border: 'border-[#BBF7D0]',
      };
    case 'Cancelado':
      return {
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#991B1B]',
        border: 'border-[#FECACA]',
      };
  }
}

export function buildWhatsAppOrderUrl(order: Order, storePhone: string): string {
  const cleanStorePhone = storePhone.replace(/\D/g, '');
  const phoneWithCountry = cleanStorePhone.startsWith('55')
    ? cleanStorePhone
    : `55${cleanStorePhone}`;

  const lines = [
    `*Novo Pedido ${order.code} — iFoome Delivery*`,
    `Cliente: ${order.customerName}`,
    `Telefone: ${order.customerPhone}`,
    `Modalidade: ${order.deliveryType === 'Entrega' ? 'Entrega' : 'Retirada no local'}`,
  ];

  if (order.deliveryType === 'Entrega' && order.address) {
    lines.push(
      `Endereço: ${order.address.street}, ${order.address.number} — ${order.address.neighborhood}${
        order.address.complement ? ` (${order.address.complement})` : ''
      }`
    );
  }

  lines.push('');
  lines.push('*Itens:*');
  order.items.forEach((item) => {
    lines.push(
      `• ${item.quantity}x ${item.name} (${formatCurrency(item.unitPrice * item.quantity)})${
        item.notes ? ` — Obs: ${item.notes}` : ''
      }`
    );
  });

  if (order.generalNotes) {
    lines.push(`Observação geral: ${order.generalNotes}`);
  }

  lines.push('');
  lines.push(`Pagamento: ${order.paymentMethod}${order.changeFor ? ` (troco p/ ${formatCurrency(order.changeFor)})` : ''}`);
  lines.push(`Total: *${formatCurrency(order.total)}*`);

  const text = encodeURIComponent(lines.join('\n'));
  if (cleanStorePhone.length >= 10) {
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}
