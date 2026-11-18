import React from 'react';
import {
  ArrowRight,
  ChefHat,
  ClipboardList,
  Info,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { AdminTab, Order, OrderStatus, StoreSettings } from '../../types';
import {
  calculateDailySummary,
  formatCurrency,
  formatOrderTime,
  getNextActionLabel,
  getNextOrderStatus,
} from '../../utils/format';
import { StatusBadge } from '../StatusBadge';

interface AdminDashboardProps {
  orders: Order[];
  productsCount: number;
  availableProductsCount: number;
  store: StoreSettings;
  onNavigateTab: (tab: AdminTab) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  productsCount,
  availableProductsCount,
  store,
  onNavigateTab,
  onUpdateOrderStatus,
}) => {
  const summary = calculateDailySummary(orders);
  const activeOrders = orders.filter(
    (order) =>
      order.status === 'Recebido' ||
      order.status === 'Em preparo' ||
      order.status === 'Saiu para entrega'
  );

  return (
    <div className="space-y-6">
      {/* Aviso claro de dados demonstrativos */}
      <div className="flex items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#F7EFE5] border border-[#E5D6C5] text-xs sm:text-sm text-[#57473F]">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-[#F47B35] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <span>
            <strong>Dados de demonstração:</strong> pedidos e pratos iniciais servem como exemplo e podem ser testados livremente.
          </span>
        </div>
      </div>

      {/* Cabeçalho contextual */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6E5D55]">{store.name}</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#382B25] tracking-tight">
            Resumo de Hoje
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>Gerenciar Pedidos</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('menu')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#DDD2C6] hover:bg-[#F7EFE5] text-[#382B25] text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#F47B35]" aria-hidden="true" />
            <span>Editar Cardápio</span>
          </button>
        </div>
      </div>

      {/* KPIs do Dia */}
      <section aria-label="Indicadores do dia" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-4 sm:p-5">
          <p className="text-xs font-semibold text-[#6E5D55]">Pedidos em andamento</p>
          <p className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#D94B3D] tabular-nums">
            {summary.inProgressCount}
          </p>
          <p className="mt-1 text-xs text-[#6E5D55]">Na cozinha ou em entrega</p>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-4 sm:p-5">
          <p className="text-xs font-semibold text-[#6E5D55]">Pedidos do dia</p>
          <p className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#382B25] tabular-nums">
            {summary.ordersCount}
          </p>
          <p className="mt-1 text-xs text-[#6E5D55]">
            {summary.cancelledCount > 0
              ? `${summary.cancelledCount} cancelado(s) excluído(s)`
              : 'Pedidos válidos hoje'}
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-4 sm:p-5">
          <p className="text-xs font-semibold text-[#6E5D55]">Total vendido hoje</p>
          <p className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#382B25] tabular-nums">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-[#6E5D55]">Soma sem cancelamentos</p>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-4 sm:p-5">
          <p className="text-xs font-semibold text-[#6E5D55]">Cardápio ativo</p>
          <p className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#382B25] tabular-nums">
            {availableProductsCount}/{productsCount}
          </p>
          <p className="mt-1 text-xs text-[#6E5D55]">
            Ticket médio {formatCurrency(summary.averageTicket)}
          </p>
        </div>
      </section>

      {/* Fila Rápida de Pedidos Ativos */}
      <section aria-label="Pedidos recentes em andamento" className="space-y-3.5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display font-bold text-lg sm:text-xl text-[#382B25]">
            Fila Ativa da Cozinha
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="text-sm font-semibold text-[#D94B3D] hover:underline flex items-center gap-1 whitespace-nowrap min-h-[40px]"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF3E6] text-[#F47B35] flex items-center justify-center mx-auto mb-3">
              <ChefHat className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="font-display font-bold text-base text-[#382B25]">
              Nenhum pedido pendente no momento
            </p>
            <p className="text-sm text-[#6E5D55] mt-1 max-w-md mx-auto">
              Assim que um cliente finalizar um pedido no cardápio público, ele aparecerá aqui para você acompanhar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.slice(0, 4).map((order) => {
              const nextStatus = getNextOrderStatus(order.status);
              const nextLabel = getNextActionLabel(order.status, order.modality);

              return (
                <article
                  key={order.id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-4 sm:p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-[#6E5D55] tabular-nums">
                        <span className="font-display font-bold text-base text-[#382B25]">
                          {order.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatOrderTime(order.createdAt)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{order.modality === 'entrega' ? 'Entrega' : 'Retirada'}</span>
                      </div>
                      <StatusBadge status={order.status} modality={order.modality} />
                    </div>

                    <div>
                      <p className="font-semibold text-base text-[#382B25]">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-[#6E5D55] mt-0.5 line-clamp-2">
                        {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F0E7DC] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-[#6E5D55] block">Total</span>
                      <span className="font-display font-bold text-base text-[#382B25] tabular-nums">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    {nextStatus && nextLabel ? (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F47B35] hover:bg-[#E06822] text-white text-sm font-semibold transition-colors whitespace-nowrap"
                      >
                        {nextLabel}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('orders')}
                        className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DDD2C6] text-sm font-semibold text-[#382B25] hover:bg-[#FFF8EF] flex items-center gap-1.5"
                      >
                        <Receipt className="w-4 h-4" aria-hidden="true" />
                        <span>Detalhes</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
