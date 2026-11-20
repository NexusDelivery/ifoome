import React, { useMemo, useState } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  Search,
  Store,
  X,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/ifoome';
import {
  formatCurrency,
  formatTime,
  getNextActionButtonText,
  getNextOrderStatus,
} from '../../utils/formatters';
import { ConfirmModal } from '../ConfirmModal';
import { StatusIndicator } from '../StatusBadge';

interface AdminOrdersProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

type OrderFilter = 'ativos' | 'todos' | OrderStatus;

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  selectedOrder,
  onSelectOrder,
  onUpdateOrderStatus,
}) => {
  const [filter, setFilter] = useState<OrderFilter>('ativos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter === 'ativos') {
        if (
          order.status !== 'Recebido' &&
          order.status !== 'Em preparo' &&
          order.status !== 'Saiu para entrega'
        ) {
          return false;
        }
      } else if (filter !== 'todos' && order.status !== filter) {
        return false;
      }

      if (!query) return true;
      return (
        order.code.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.toLowerCase().includes(query)
      );
    });
  }, [orders, filter, searchQuery]);

  const filterOptions: { id: OrderFilter; label: string }[] = [
    { id: 'ativos', label: 'Ativos na cozinha' },
    { id: 'todos', label: 'Todos' },
    { id: 'Recebido', label: 'Recebido' },
    { id: 'Em preparo', label: 'Em preparo' },
    { id: 'Saiu para entrega', label: 'Saiu / Pronto' },
    { id: 'Concluído', label: 'Concluído' },
    { id: 'Cancelado', label: 'Cancelado' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
          Gerenciamento de Pedidos
        </h2>
        <p className="mt-1 text-sm text-[#263238]/75">
          Acompanhe os pedidos em fila, veja observações e atualize o status com um toque.
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                filter === opt.id
                  ? 'bg-[#287A55] text-white'
                  : 'bg-white border border-[#DCE6E0] text-[#263238]/80 hover:bg-[#DDEFE3]/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search
            className="w-4 h-4 text-[#263238]/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código ou cliente..."
            aria-label="Buscar pedido"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white border border-[#DCE6E0] text-sm text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#287A55]"
          />
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE6E0] p-10 text-center">
          <p className="text-base font-bold text-[#263238]">
            Nenhum pedido encontrado neste filtro.
          </p>
          <p className="mt-1 text-sm text-[#263238]/65">
            Tente mudar o filtro para "Todos" para consultar o histórico completo do dia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextOrderStatus(order.status);
            const nextActionText = getNextActionButtonText(
              order.status,
              order.deliveryMode
            );
            const canCancel =
              order.status !== 'Concluído' && order.status !== 'Cancelado';

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-[#DCE6E0] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#263238]/65">
                        <span className="font-mono text-base font-extrabold text-[#263238] tabular-nums">
                          {order.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-[#263238]">
                        {order.customerName}
                      </h3>
                    </div>

                    <StatusIndicator
                      status={order.status}
                      deliveryMode={order.deliveryMode}
                    />
                  </div>

                  {/* Modalidade / Endereço */}
                  <div className="rounded-xl bg-[#F6F9F7] px-3.5 py-2.5 text-xs text-[#263238]/85 flex items-start gap-2">
                    {order.deliveryMode === 'entrega' ? (
                      <>
                        <Bike className="w-4 h-4 text-[#287A55] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          <strong>Entrega:</strong>{' '}
                          {order.address
                            ? `${order.address.street}, ${order.address.number} · ${order.address.neighborhood}${
                                order.address.complement
                                  ? ` (${order.address.complement})`
                                  : ''
                              }`
                            : 'Endereço não informado'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Store className="w-4 h-4 text-[#287A55] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          <strong>Retirada no balcão</strong>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Itens solicitados */}
                  <ul className="space-y-1.5 text-sm">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-[#263238]">
                        <span className="font-mono font-bold tabular-nums mr-1.5">
                          {item.quantity}x
                        </span>
                        <span>{item.name}</span>
                        {item.observation && (
                          <span className="block text-xs text-[#9A6E04] font-medium ml-6">
                            Obs.: {item.observation}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {order.generalObservation && (
                    <p className="text-xs text-[#263238]/80 bg-[#F4C95D]/20 rounded-lg px-3 py-2">
                      <strong>Observação do cliente:</strong> {order.generalObservation}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E6EFEA] space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#263238]/75">
                      {order.paymentMethod}
                      {order.changeFor
                        ? ` (troco p/ ${formatCurrency(order.changeFor)})`
                        : ''}
                    </span>
                    <span className="font-mono text-lg font-extrabold text-[#263238] tabular-nums">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {nextStatus && nextActionText && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                        className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] transition-colors whitespace-nowrap"
                      >
                        {nextActionText}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] bg-white text-xs font-semibold text-[#263238] hover:bg-[#F6F9F7] whitespace-nowrap"
                    >
                      Detalhes
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(order)}
                        aria-label={`Cancelar pedido ${order.code}`}
                        className="min-h-[44px] px-3 py-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Cancelar</span>
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#263238]/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
        >
          <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-[#DCE6E0] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E6EFEA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 id="order-detail-title" className="text-lg font-extrabold text-[#263238]">
                  Pedido <span className="font-mono tabular-nums">{selectedOrder.code}</span>
                </h3>
                <StatusIndicator
                  status={selectedOrder.status}
                  deliveryMode={selectedOrder.deliveryMode}
                />
              </div>
              <button
                type="button"
                onClick={() => onSelectOrder(null)}
                aria-label="Fechar detalhes do pedido"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#263238]/65 hover:bg-[#F6F9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-bold text-[#263238] text-base">
                  {selectedOrder.customerName}
                </p>
                <p className="inline-flex items-center gap-1.5 text-[#263238]/75 font-mono text-xs tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-[#287A55]" aria-hidden="true" />
                  <span>{selectedOrder.customerPhone}</span>
                  <span aria-hidden="true">·</span>
                  <span>Pedido às {formatTime(selectedOrder.createdAt)}</span>
                </p>
              </div>

              <div className="rounded-xl bg-[#F6F9F7] border border-[#E6EFEA] p-3.5 space-y-1">
                <p className="font-semibold text-[#263238] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#287A55]" aria-hidden="true" />
                  <span>
                    {selectedOrder.deliveryMode === 'entrega'
                      ? 'Entrega no endereço'
                      : 'Retirada no balcão'}
                  </span>
                </p>
                {selectedOrder.deliveryMode === 'entrega' && selectedOrder.address && (
                  <p className="text-[#263238]/80 text-xs pl-5">
                    {selectedOrder.address.street}, {selectedOrder.address.number} —{' '}
                    {selectedOrder.address.neighborhood}
                    {selectedOrder.address.complement
                      ? ` (${selectedOrder.address.complement})`
                      : ''}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-[#263238] mb-2">Itens</h4>
                <ul className="divide-y divide-[#E6EFEA]">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx} className="py-2 flex justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#263238]">
                          <span className="font-mono font-bold tabular-nums mr-1.5">
                            {item.quantity}x
                          </span>
                          {item.name}
                        </p>
                        {item.observation && (
                          <p className="text-xs text-[#9A6E04]">Obs.: {item.observation}</p>
                        )}
                      </div>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedOrder.generalObservation && (
                <div className="rounded-xl bg-[#F4C95D]/20 p-3 text-xs text-[#263238]">
                  <strong>Observação geral:</strong> {selectedOrder.generalObservation}
                </div>
              )}

              <div className="pt-3 border-t border-[#E6EFEA] space-y-1.5">
                <div className="flex justify-between text-[#263238]/75">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#263238]/75">
                  <span>Taxa de entrega</span>
                  <span className="font-mono tabular-nums">
                    {selectedOrder.deliveryFee > 0
                      ? formatCurrency(selectedOrder.deliveryFee)
                      : 'Grátis'}
                  </span>
                </div>
                <div className="flex justify-between text-[#263238]/75">
                  <span>Pagamento</span>
                  <span>
                    {selectedOrder.paymentMethod}
                    {selectedOrder.changeFor
                      ? ` (troco p/ ${formatCurrency(selectedOrder.changeFor)})`
                      : ''}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E6EFEA] flex justify-between text-base font-extrabold text-[#263238]">
                  <span>Total</span>
                  <span className="font-mono text-[#287A55] tabular-nums">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Controle manual direto de status */}
            <div className="p-4 border-t border-[#E6EFEA] bg-[#F6F9F7] space-y-2">
              <p className="text-xs font-semibold text-[#263238]/70">
                Alterar status manualmente:
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'Recebido',
                    'Em preparo',
                    'Saiu para entrega',
                    'Concluído',
                  ] as OrderStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, st);
                      onSelectOrder({ ...selectedOrder, status: st });
                    }}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedOrder.status === st
                        ? 'bg-[#287A55] text-white border-[#287A55]'
                        : 'bg-white text-[#263238] border-[#DCE6E0] hover:bg-[#DDEFE3]/50'
                    }`}
                  >
                    {st === 'Saiu para entrega' &&
                    selectedOrder.deliveryMode === 'retirada'
                      ? 'Pronto p/ retirada'
                      : st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      <ConfirmModal
        open={Boolean(cancelTarget)}
        title={`Cancelar pedido ${cancelTarget?.code || ''}?`}
        description="Pedidos cancelados não entram no total vendido do dia e saem da fila ativa da cozinha."
        confirmLabel="Sim, cancelar pedido"
        cancelLabel="Manter pedido"
        destructive
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) {
            onUpdateOrderStatus(cancelTarget.id, 'Cancelado');
            setCancelTarget(null);
          }
        }}
      />
    </div>
  );
};
