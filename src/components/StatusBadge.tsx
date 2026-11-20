import React from 'react';
import { DeliveryModality, OrderStatus } from '../types';
import { getDisplayStatusLabel } from '../utils/format';

interface StatusBadgeProps {
  status: OrderStatus;
  modality?: DeliveryModality;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Recebido: 'bg-[#FFF3E6] text-[#B54708] border-[#F47B35]/35',
  'Em preparo': 'bg-[#FDECE9] text-[#B42318] border-[#FECDCA]',
  'Saiu para entrega': 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  Concluído: 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]',
  Cancelado: 'bg-[#F5F1ED] text-[#6E5D55] border-[#DDD2C6]',
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
