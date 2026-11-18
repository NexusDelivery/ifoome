import React, { useState } from 'react';
import {
  Ban,
  Eye,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import {
  formatCurrency,
  formatOrderTime,
  getNextActionLabel,
  getNextOrderStatus,
} from '../../utils/format';
import { StatusBadge } from '../StatusBadge';
import { ConfirmDialog } from '../ConfirmDialog';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

type OrderFilter = 'Ativos' | 'Todos' | OrderStatus;

const FILTERS: OrderFilter[] = [
  'Ativos',
  'Recebido',
  'Em preparo',
  'Saiu para entrega',
  'Concluído',
  'Cancelado',
  'Todos',
];

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [filter, setFilter] = useState<OrderFilter>('Ativos');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filter === 'Todos'
        ? true
        : filter === 'Ativos'
          ? order.status === 'Recebido' ||
            order.status === 'Em preparo' ||
            order.status === 'Saiu para entrega'
          : order.status === filter;

    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.code.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const getCountForFilter = (f: OrderFilter) => {
    if (f === 'Todos') return orders.length;
    if (f === 'Ativos') {
      return orders.filter(
        (o) =>
          o.status === 'Recebido' ||
          o.status === 'Em preparo' ||
          o.status === 'Saiu para entrega'
      ).length;
    }
    return orders.filter((o) => o.status === f).length;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#382B25]">Pedidos</h2>
          <p className="text-sm text-[#6E5D55]">
            Acompanhe a cozinha e atualize o andamento com um toque.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-[#6E5D55] absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código ou cliente..."
            aria-label="Buscar pedido por código ou cliente"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#DDD2C6] text-sm text-[#382B25] placeholder:text-[#8E7D74] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
          />
        </div>
      </div>

      {/* Filtros de Status */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filtrar pedidos por status"
      >
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const count = getCountForFilter(f);
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(f)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#382B25] text-[#FFF8EF]'
                  : 'bg-[#FFFFFF] border border-[#EAE0D5] text-[#6E5D55] hover:text-[#382B25]'
              }`}
            >
              <span>{f}</span>
              <span
                className={`tabular-nums text-xs ${
                  isActive ? 'text-[#F47B35]' : 'text-[#8E7D74]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-8 text-center">
          <p className="font-display font-bold text-base text-[#382B25]">
            Nenhum pedido encontrado neste filtro
          </p>
          <p className="text-sm text-[#6E5D55] mt-1">
            Tente selecionar "Todos" ou limpar a busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextOrderStatus(order.status);
            const nextLabel = getNextActionLabel(order.status, order.modality);
            const canCancel =
              order.status !== 'Concluído' && order.status !== 'Cancelado';

            return (
              <article
                key={order.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-4 sm:p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Linha superior: Código, Horário, Modalidade e Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6E5D55] tabular-nums">
                      <span className="font-display font-extrabold text-base text-[#382B25]">
                        {order.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatOrderTime(order.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#382B25]">
                        {order.modality === 'entrega' ? 'Entrega' : 'Retirada no local'}
                      </span>
                    </div>
                    <StatusBadge status={order.status} modality={order.modality} />
                  </div>

                  {/* Dados do Cliente */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-bold text-[#382B25]">{order.customerName}</span>
                    <span className="inline-flex items-center gap-1.5 text-[#6E5D55] tabular-nums">
                      <Phone className="w-3.5 h-3.5 text-[#F47B35]" aria-hidden="true" />
                      {order.customerPhone}
                    </span>
                  </div>

                  {/* Itens */}
                  <ul className="space-y-1.5 text-sm border-t border-b border-[#F2EAE0] py-3">
                    {order.items.map((item, idx) => (
                      <li key={`${order.id}-${idx}`} className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-semibold text-[#382B25]">
                            {item.quantity}x {item.name}
                          </span>
                          {item.observation && (
                            <p className="text-xs text-[#B42318] mt-0.5">
                              Obs: {item.observation}
                            </p>
                          )}
                        </div>
                        <span className="text-[#6E5D55] tabular-nums shrink-0">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Endereço / Pagamento / Obs Geral */}
                  <div className="space-y-1.5 text-xs sm:text-sm text-[#6E5D55]">
                    {order.modality === 'entrega' && order.address ? (
                      <p className="flex items-start gap-2">
                        <MapPin
                          className="w-4 h-4 text-[#F47B35] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>
                          {order.address.street}, {order.address.number} —{' '}
                          {order.address.neighborhood}
                          {order.address.complement ? ` (${order.address.complement})` : ''}
                        </span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#F47B35] shrink-0" aria-hidden="true" />
                        <span>Cliente retirará no balcão</span>
                      </p>
                    )}

                    <p>
                      <strong className="text-[#382B25]">Pagamento:</strong> {order.paymentMethod}
                      {order.paymentMethod === 'Dinheiro' && order.changeFor
                        ? ` (troco p/ ${formatCurrency(order.changeFor)})`
                        : ''}
                    </p>

                    {order.generalObservation && (
                      <p className="text-[#B54708] bg-[#FFF3E6] px-3 py-1.5 rounded-lg">
                        <strong>Obs. do cliente:</strong> {order.generalObservation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="pt-3 border-t border-[#F2EAE0] flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <span className="text-xs text-[#6E5D55] block">Total do pedido</span>
                    <span className="font-display font-extrabold text-lg text-[#382B25] tabular-nums">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="min-h-[44px] px-3 py-2 rounded-xl border border-[#DDD2C6] text-xs sm:text-sm font-semibold text-[#382B25] hover:bg-[#FFF8EF] flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span>Detalhes</span>
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setOrderToCancel(order)}
                        aria-label={`Cancelar pedido ${order.code}`}
                        className="min-h-[44px] px-3 py-2 rounded-xl border border-[#FECDCA] text-xs sm:text-sm font-semibold text-[#B42318] hover:bg-[#FDECE9] flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Ban className="w-4 h-4" aria-hidden="true" />
                        <span>Cancelar</span>
                      </button>
                    )}

                    {nextStatus && nextLabel && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                      >
                        {nextLabel}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#382B25]/50 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
        >
          <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl border border-[#EAE0D5] p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#6E5D55] tabular-nums">
                  Pedido registrado às {formatOrderTime(selectedOrder.createdAt)}
                </p>
                <h3
                  id="order-detail-title"
                  className="font-display font-bold text-xl text-[#382B25] mt-0.5"
                >
                  Pedido {selectedOrder.code} · {selectedOrder.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Fechar detalhes do pedido"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-xl flex items-center justify-center text-[#6E5D55] hover:bg-[#F7EFE5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EAE0D5]">
              <StatusBadge status={selectedOrder.status} modality={selectedOrder.modality} />
              <span className="text-sm font-semibold text-[#382B25] tabular-nums">
                {selectedOrder.customerPhone}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#6E5D55]">Itens solicitados</p>
              <ul className="divide-y divide-[#F2EAE0] border border-[#EAE0D5] rounded-xl px-4">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx} className="py-3 flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#382B25]">
                        {item.quantity}x {item.name}
                      </p>
                      {item.observation && (
                        <p className="text-xs text-[#B42318] mt-0.5">Obs: {item.observation}</p>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums text-[#382B25]">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-sm space-y-1.5 bg-[#FFF8EF] rounded-xl p-4 border border-[#EAE0D5]">
              <div className="flex justify-between text-[#6E5D55]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6E5D55]">
                <span>Taxa de entrega</span>
                <span className="tabular-nums">
                  {selectedOrder.deliveryFee === 0
                    ? 'Grátis'
                    : formatCurrency(selectedOrder.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-display font-bold text-base text-[#382B25] pt-2 border-t border-[#E5D6C5]">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {selectedOrder.status !== 'Concluído' && selectedOrder.status !== 'Cancelado' && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#6E5D55]">Atualizar status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['Recebido', 'Em preparo', 'Saiu para entrega', 'Concluído'] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          onUpdateOrderStatus(selectedOrder.id, st);
                          setSelectedOrder({ ...selectedOrder, status: st });
                        }}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                          selectedOrder.status === st
                            ? 'bg-[#382B25] text-white border-[#382B25]'
                            : 'bg-[#FFFFFF] text-[#382B25] border-[#DDD2C6] hover:bg-[#FFF8EF]'
                        }`}
                      >
                        {st === 'Saiu para entrega' && selectedOrder.modality === 'retirada'
                          ? 'Pronto p/ retirada'
                          : st}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmação de Cancelamento */}
      <ConfirmDialog
        open={Boolean(orderToCancel)}
        title={`Cancelar pedido ${orderToCancel?.code ?? ''}?`}
        description="Pedidos cancelados saem da fila da cozinha e não são somados no total vendido do dia."
        confirmLabel="Sim, cancelar pedido"
        destructive
        onCancel={() => setOrderToCancel(null)}
        onConfirm={() => {
          if (orderToCancel) {
            onUpdateOrderStatus(orderToCancel.id, 'Cancelado');
            setOrderToCancel(null);
          }
        }}
      />
    </div>
  );
};
