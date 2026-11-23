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

export type OrderFilter = 'Ativos' | 'Todos' | OrderStatus;

interface AdminOrdersProps {
  orders: Order[];
  filter: OrderFilter;
  onChangeFilter: (filter: OrderFilter) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

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
  filter,
  onChangeFilter,
  onUpdateOrderStatus,
}) => {
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const selectedOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId) ?? null
    : null;

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
          <h2 className="font-display font-bold text-2xl text-white">Pedidos</h2>
          <p className="text-sm text-slate-400">
            Acompanhe a cozinha e avance os pedidos sem permitir retrocessos acidentais.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código ou cliente..."
            aria-label="Buscar pedido por código ou cliente"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Filtros de Status */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
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
              onClick={() => onChangeFilter(f)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{f}</span>
              <span
                className={`tabular-nums text-xs ${
                  isActive ? 'text-white/90' : 'text-slate-400'
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
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
          <p className="font-display font-bold text-base text-white">
            Nenhum pedido encontrado neste filtro
          </p>
          <p className="text-sm text-slate-400 mt-1">
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
                className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  {/* Linha superior: Código, Horário, Modalidade e Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 tabular-nums">
                      <span className="font-display font-extrabold text-base text-white">
                        {order.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatOrderTime(order.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-200">
                        {order.modality === 'entrega' ? 'Entrega' : 'Retirada no local'}
                      </span>
                    </div>
                    <StatusBadge status={order.status} modality={order.modality} />
                  </div>

                  {/* Dados do Cliente */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-bold text-white">{order.customerName}</span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300 tabular-nums">
                      <Phone className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                      {order.customerPhone}
                    </span>
                  </div>

                  {/* Itens */}
                  <ul className="space-y-1.5 text-sm border-t border-b border-slate-800 py-3">
                    {order.items.map((item, idx) => (
                      <li key={`${order.id}-${idx}`} className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-200">
                            {item.quantity}x {item.name}
                          </span>
                          {item.observation && (
                            <p className="text-xs text-orange-300 mt-0.5">
                              Obs: {item.observation}
                            </p>
                          )}
                        </div>
                        <span className="text-slate-300 tabular-nums shrink-0">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Endereço / Pagamento / Obs Geral */}
                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    {order.modality === 'entrega' && order.address ? (
                      <p className="flex items-start gap-2">
                        <MapPin
                          className="w-4 h-4 text-orange-400 shrink-0 mt-0.5"
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
                        <ShoppingBag className="w-4 h-4 text-orange-400 shrink-0" aria-hidden="true" />
                        <span>Cliente retirará no balcão</span>
                      </p>
                    )}

                    <p>
                      <strong className="text-white">Pagamento:</strong> {order.paymentMethod}
                      {order.paymentMethod === 'Dinheiro' && order.changeFor
                        ? ` (troco p/ ${formatCurrency(order.changeFor)})`
                        : ''}
                    </p>

                    {order.generalObservation && (
                      <p className="text-amber-200 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                        <strong>Obs. do cliente:</strong> {order.generalObservation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <span className="text-xs text-slate-400 block">Total do pedido</span>
                    <span className="font-display font-extrabold text-lg text-orange-400 tabular-nums">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/70 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span>Detalhes</span>
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setOrderToCancel(order)}
                        aria-label={`Cancelar pedido ${order.code}`}
                        className="min-h-[44px] px-3 py-2 rounded-xl border border-red-500/40 text-xs sm:text-sm font-semibold text-red-300 hover:bg-red-500/15 flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Ban className="w-4 h-4" aria-hidden="true" />
                        <span>Cancelar</span>
                      </button>
                    )}

                    {nextStatus && nextLabel && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-orange-500/20 whitespace-nowrap"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
        >
          <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 tabular-nums">
                  Pedido registrado às {formatOrderTime(selectedOrder.createdAt)}
                </p>
                <h3
                  id="order-detail-title"
                  className="font-display font-bold text-xl text-white mt-0.5"
                >
                  Pedido {selectedOrder.code} · {selectedOrder.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                aria-label="Fechar detalhes do pedido"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <StatusBadge status={selectedOrder.status} modality={selectedOrder.modality} />
              <span className="text-sm font-semibold text-slate-200 tabular-nums">
                {selectedOrder.customerPhone}
              </span>
            </div>

            {selectedOrder.modality === 'entrega' && selectedOrder.address ? (
              <div className="text-sm text-slate-300 bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/70">
                <strong className="text-white">Endereço de entrega: </strong>
                {selectedOrder.address.street}, {selectedOrder.address.number} —{' '}
                {selectedOrder.address.neighborhood}
                {selectedOrder.address.complement
                  ? ` (${selectedOrder.address.complement})`
                  : ''}
              </div>
            ) : (
              <div className="text-sm text-slate-300 bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/70">
                <strong className="text-white">Modalidade: </strong>
                Retirada no estabelecimento
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Itens solicitados
              </p>
              <ul className="divide-y divide-slate-800 border border-slate-800 rounded-xl px-4 bg-slate-800/30">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx} className="py-3 flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">
                        {item.quantity}x {item.name}
                      </p>
                      {item.observation && (
                        <p className="text-xs text-orange-300 mt-0.5">Obs: {item.observation}</p>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums text-slate-200">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedOrder.generalObservation && (
              <p className="text-xs sm:text-sm text-amber-200 bg-amber-500/15 border border-amber-500/30 px-3.5 py-2.5 rounded-xl">
                <strong>Observação geral:</strong> {selectedOrder.generalObservation}
              </p>
            )}

            <div className="text-sm space-y-1.5 bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
              <div className="flex justify-between text-slate-400">
                <span>Pagamento</span>
                <span className="font-semibold text-white">
                  {selectedOrder.paymentMethod}
                  {selectedOrder.paymentMethod === 'Dinheiro' && selectedOrder.changeFor
                    ? ` (troco p/ ${formatCurrency(selectedOrder.changeFor)})`
                    : ''}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="tabular-nums text-slate-200">
                  {formatCurrency(selectedOrder.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxa de entrega</span>
                <span className="tabular-nums text-emerald-400 font-semibold">
                  {selectedOrder.deliveryFee === 0
                    ? 'Grátis'
                    : formatCurrency(selectedOrder.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-display font-bold text-base text-white pt-2 border-t border-slate-700">
                <span>Total</span>
                <span className="tabular-nums text-orange-400">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>

            {(() => {
              const nextStatus = getNextOrderStatus(selectedOrder.status);
              const nextLabel = getNextActionLabel(
                selectedOrder.status,
                selectedOrder.modality
              );
              const canCancel =
                selectedOrder.status !== 'Concluído' &&
                selectedOrder.status !== 'Cancelado';

              if (!nextStatus && !canCancel) {
                return (
                  <p className="text-xs text-slate-400 text-center pt-1">
                    Pedido encerrado no status <strong className="text-slate-200">{selectedOrder.status}</strong>.
                  </p>
                );
              }

              return (
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => setOrderToCancel(selectedOrder)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl border border-red-500/40 text-sm font-semibold text-red-300 hover:bg-red-500/15"
                    >
                      Cancelar pedido
                    </button>
                  )}
                  {nextStatus && nextLabel && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, nextStatus)}
                      className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-semibold transition-all shadow-md shadow-orange-500/20"
                    >
                      Avançar para: {nextLabel}
                    </button>
                  )}
                </div>
              );
            })()}
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
