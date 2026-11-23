import React from 'react';
import { DeliveryModality, OrderStatus } from '../types';
import { getDisplayStatusLabel } from '../utils/format';

interface StatusBadgeProps {
  status: OrderStatus;
  modality?: DeliveryModality;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Recebido: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
  'Em preparo': 'bg-orange-500/15 text-orange-300 border-orange-500/35',
  'Saiu para entrega': 'bg-sky-500/15 text-sky-300 border-sky-500/35',
  Concluído: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
  Cancelado: 'bg-slate-800 text-slate-400 border-slate-700',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  modality = 'entrega',
}) => {
  const label = getDisplayStatusLabel(status, modality);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
};
