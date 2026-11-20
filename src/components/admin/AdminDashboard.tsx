import React from 'react';
import {
  ArrowRight,
  ClipboardList,
  Clock,
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import { AdminSection, Order, OrderStatus } from '../../types/ifoome';
import {
  calculateDailySummary,
  formatCurrency,
  formatTime,
  getNextActionButtonText,
  getNextOrderStatus,
} from '../../utils/formatters';
import { StatusIndicator } from '../StatusBadge';

interface AdminDashboardProps {
  orders: Order[];
  dishesCount: number;
  availableDishesCount: number;
  onNavigate: (section: AdminSection) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenOrderDetails: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  dishesCount,
  availableDishesCount,
  onNavigate,
  onUpdateOrderStatus,
  onOpenOrderDetails,
}) => {
  const summary = calculateDailySummary(orders);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Cabeçalho de boas-vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
            Resumo do Dia
          </h2>
          <p className="mt-1 text-sm text-[#263238]/75">
            Acompanhe as vendas de hoje e dê andamento rápido aos pedidos da cozinha.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('pedidos')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>Ver fila de pedidos</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cardapio')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-[#DCE6E0] text-[#263238] text-sm font-semibold hover:bg-[#DDEFE3]/40 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#287A55]" aria-hidden="true" />
            <span>Gerenciar cardápio</span>
          </button>
        </div>
      </div>

      {/* Cartões de Indicadores (KPIs) */}
      <section aria-label="Indicadores do dia" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#DCE6E0] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#263238]/75">
              Pedidos em andamento
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#F4C95D]/30 text-[#9A6E04] flex items-center justify-center">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#263238] font-mono tabular-nums">
              {summary.activeOrdersCount}
            </p>
            <p className="mt-1 text-xs text-[#263238]/65">
              Recebidos, em preparo ou em entrega
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE6E0] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#263238]/75">
              Pedidos válidos hoje
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#DDEFE3] text-[#287A55] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#263238] font-mono tabular-nums">
              {summary.totalOrdersCount}
            </p>
            <p className="mt-1 text-xs text-[#263238]/65">
              {summary.cancelledCount > 0
                ? `${summary.cancelledCount} cancelado(s) fora da soma`
                : `Ticket médio: ${formatCurrency(summary.averageTicket)}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE6E0] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#263238]/75">
              Total vendido hoje
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#287A55] text-white flex items-center justify-center">
              <DollarSign className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#287A55] font-mono tabular-nums">
              {formatCurrency(summary.totalSold)}
            </p>
            <p className="mt-1 text-xs text-[#263238]/65">
              Cardápio: {availableDishesCount} de {dishesCount} pratos ativos
            </p>
          </div>
        </div>
      </section>

      {/* Lista de Pedidos Recentes */}
      <section className="bg-white rounded-2xl border border-[#DCE6E0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E6EFEA] flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#263238]">Pedidos recentes</h3>
            <p className="text-xs text-[#263238]/65">
              Atualize o status com um toque direto pelo celular
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('pedidos')}
            className="min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-semibold text-[#287A55] hover:bg-[#DDEFE3]/50 inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-[#263238]">
              Nenhum pedido registrado ainda hoje.
            </p>
            <p className="mt-1 text-xs text-[#263238]/65">
              Assim que um cliente finalizar um pedido no cardápio público, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6EFEA]">
            {recentOrders.map((order) => {
              const nextStatus = getNextOrderStatus(order.status);
              const nextActionText = getNextActionButtonText(
                order.status,
                order.deliveryMode
              );

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F6F9F7]/60 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#263238] tabular-nums">
                        {order.code}
                      </span>
                      <StatusIndicator
                        status={order.status}
                        deliveryMode={order.deliveryMode}
                      />
                      <span className="text-xs text-[#263238]/65 font-mono tabular-nums">
                        {formatTime(order.createdAt)}
                      </span>
                      <span className="text-xs font-semibold text-[#263238]/70">
                        · {order.deliveryMode === 'entrega' ? 'Entrega' : 'Retirada'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-[#263238]">
                      {order.customerName}{' '}
                      <span className="font-normal text-[#263238]/65 font-mono text-xs tabular-nums">
                        {order.customerPhone}
                      </span>
                    </p>

                    <p className="text-xs text-[#263238]/75 truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0">
                    <span className="font-mono text-base font-bold text-[#263238] tabular-nums">
                      {formatCurrency(order.total)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenOrderDetails(order)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] bg-white text-xs font-semibold text-[#263238] hover:bg-[#F6F9F7] whitespace-nowrap"
                      >
                        Detalhes
                      </button>

                      {nextStatus && nextActionText && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#287A55] text-white text-xs font-semibold hover:bg-[#1E6143] transition-colors whitespace-nowrap"
                        >
                          {nextActionText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
