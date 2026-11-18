import { Order, OrderStatus } from '../types';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatOrderTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isSameLocalDay(isoString: string, referenceDate = new Date()): boolean {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getDate() === referenceDate.getDate()
  );
}

export interface DailySummary {
  ordersCount: number;
  totalRevenue: number;
  inProgressCount: number;
  cancelledCount: number;
  averageTicket: number;
}

/**
 * Calcula os indicadores do resumo diário conforme RN-06:
 * - Pedidos Cancelado são excluídos do total vendido e da contagem de pedidos válidos.
 * - Pedidos em andamento incluem: Recebido, Em preparo e Saiu para entrega.
 */
export function calculateDailySummary(orders: Order[], referenceDate = new Date()): DailySummary {
  const todayOrders = orders.filter((order) => isSameLocalDay(order.createdAt, referenceDate));
  const validTodayOrders = todayOrders.filter((order) => order.status !== 'Cancelado');
  const cancelledCount = todayOrders.filter((order) => order.status === 'Cancelado').length;
  const inProgressCount = validTodayOrders.filter(
    (order) =>
      order.status === 'Recebido' ||
      order.status === 'Em preparo' ||
      order.status === 'Saiu para entrega'
  ).length;

  const totalRevenue = validTodayOrders.reduce((acc, order) => acc + order.total, 0);
  const ordersCount = validTodayOrders.length;
  const averageTicket = ordersCount > 0 ? totalRevenue / ordersCount : 0;

  return {
    ordersCount,
    totalRevenue,
    inProgressCount,
    cancelledCount,
    averageTicket,
  };
}

export function getDisplayStatusLabel(
  status: OrderStatus,
  modality: 'entrega' | 'retirada'
): string {
  if (status === 'Saiu para entrega' && modality === 'retirada') {
    return 'Pronto para retirada';
  }
  return status;
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case 'Recebido':
      return 'Em preparo';
    case 'Em preparo':
      return 'Saiu para entrega';
    case 'Saiu para entrega':
      return 'Concluído';
    default:
      return null;
  }
}

export function getNextActionLabel(
  status: OrderStatus,
  modality: 'entrega' | 'retirada'
): string | null {
  switch (status) {
    case 'Recebido':
      return 'Iniciar preparo';
    case 'Em preparo':
      return modality === 'retirada' ? 'Pronto p/ retirada' : 'Saiu para entrega';
    case 'Saiu para entrega':
      return 'Concluir pedido';
    default:
      return null;
  }
}

export function buildWhatsAppOrderMessage(order: Order, storeName: string): string {
  const lines: string[] = [
    `*Novo Pedido ${order.code} — ${storeName}*`,
    `Cliente: ${order.customerName}`,
    `Telefone: ${order.customerPhone}`,
    '',
    '*Itens:*',
    ...order.items.map(
      (item) =>
        `- ${item.quantity}x ${item.name} (${formatCurrency(item.unitPrice * item.quantity)})${
          item.observation ? ` — Obs: ${item.observation}` : ''
        }`
    ),
    '',
    `Modalidade: ${order.modality === 'entrega' ? 'Entrega' : 'Retirada no local'}`,
  ];

  if (order.modality === 'entrega' && order.address) {
    lines.push(
      `Endereço: ${order.address.street}, ${order.address.number} - ${order.address.neighborhood}${
        order.address.complement ? ` (${order.address.complement})` : ''
      }`
    );
  }

  lines.push(
    `Pagamento: ${order.paymentMethod}${
      order.paymentMethod === 'Dinheiro' && order.changeFor
        ? ` (troco para ${formatCurrency(order.changeFor)})`
        : ''
    }`
  );

  if (order.generalObservation) {
    lines.push(`Observação: ${order.generalObservation}`);
  }

  lines.push(
    `Taxa de entrega: ${order.deliveryFee === 0 ? 'Grátis' : formatCurrency(order.deliveryFee)}`,
    `*Total: ${formatCurrency(order.total)}*`
  );

  return lines.join('\n');
}
