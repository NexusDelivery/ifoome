import React from 'react';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Truck,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { DeliveryModality, OrderStatus } from '../types';
import { getDisplayStatusLabel } from '../utils/format';

interface StatusBadgeProps {
  status: OrderStatus;
  modality: DeliveryModality;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, modality }) => {
  const label = getDisplayStatusLabel(status, modality);

  const config: Record<
    OrderStatus,
    { bg: string; text: string; border: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    Recebido: {
      bg: 'bg-[#FFF3E6]',
      text: 'text-[#B54708]',
      border: 'border-[#F47B35]/35',
      Icon: Clock,
    },
    'Em preparo': {
      bg: 'bg-[#FDECE9]',
      text: 'text-[#B42318]',
      border: 'border-[#D94B3D]/35',
      Icon: ChefHat,
    },
    'Saiu para entrega': {
      bg: 'bg-[#EFF6FF]',
      text: 'text-[#1D4ED8]',
      border: 'border-[#93C5FD]',
      Icon: modality === 'retirada' ? ShoppingBag : Truck,
    },
    Concluído: {
      bg: 'bg-[#ECFDF3]',
      text: 'text-[#027A48]',
      border: 'border-[#A6F4C5]',
      Icon: CheckCircle2,
    },
    Cancelado: {
      bg: 'bg-[#F5F1ED]',
      text: 'text-[#6E5D55]',
      border: 'border-[#DDD2C6]',
      Icon: XCircle,
    },
  };

  const { bg, text, border, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 ${bg} ${text} ${border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
