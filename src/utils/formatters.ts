import { Order, OrderStatus } from '../types/ifoome';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isSameLocalDay(isoDate: string, reference = new Date()): boolean {
  const target = new Date(isoDate);
  return (
    target.getFullYear() === reference.getFullYear() &&
    target.getMonth() === reference.getMonth() &&
    target.getDate() === reference.getDate()
  );
}

export function calculateDailySummary(orders: Order[]) {
  const todayOrders = orders.filter((order) => isSameLocalDay(order.createdAt));
  const validTodayOrders = todayOrders.filter((order) => order.status !== 'Cancelado');
  const activeOrders = todayOrders.filter(
    (order) =>
      order.status === 'Recebido' ||
      order.status === 'Em preparo' ||
      order.status === 'Saiu para entrega'
  );
  const cancelledCount = todayOrders.filter((order) => order.status === 'Cancelado').length;
  const totalSold = validTodayOrders.reduce((acc, order) => acc + order.total, 0);
  const averageTicket =
    validTodayOrders.length > 0 ? totalSold / validTodayOrders.length : 0;

  return {
    totalOrdersCount: validTodayOrders.length,
    activeOrdersCount: activeOrders.length,
    cancelledCount,
    totalSold,
    averageTicket,
  };
}

export function getOrderStatusActionLabel(
  status: OrderStatus,
  deliveryMode: 'entrega' | 'retirada'
): string {
  if (status === 'Saiu para entrega' && deliveryMode === 'retirada') {
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

export function getNextActionButtonText(
  status: OrderStatus,
  deliveryMode: 'entrega' | 'retirada'
): string | null {
  switch (status) {
    case 'Recebido':
      return 'Iniciar preparo';
    case 'Em preparo':
      return deliveryMode === 'retirada' ? 'Pronto p/ retirada' : 'Saiu para entrega';
    case 'Saiu para entrega':
      return 'Concluir pedido';
    default:
      return null;
  }
}
