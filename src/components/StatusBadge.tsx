import React from 'react';
import { BellRing, Bike, CheckCircle2, Flame, PackageCheck, XCircle } from 'lucide-react';
import { DeliveryMode, OrderStatus } from '../types/ifoome';
import { getOrderStatusActionLabel } from '../utils/formatters';

interface StatusBadgeProps {
  status: OrderStatus;
  deliveryMode?: DeliveryMode;
}

export const StatusIndicator: React.FC<StatusBadgeProps> = ({
  status,
  deliveryMode = 'entrega',
}) => {
  const label = getOrderStatusActionLabel(status, deliveryMode);

  const config: Record<
    OrderStatus,
    { bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    Recebido: {
      bg: 'bg-[#F4C95D]/25',
      text: 'text-[#263238]',
      border: 'border-[#F4C95D]',
      icon: <BellRing className="w-3.5 h-3.5 shrink-0 text-[#9A6E04]" aria-hidden="true" />,
    },
    'Em preparo': {
      bg: 'bg-[#DDEFE3]',
      text: 'text-[#1E6143]',
      border: 'border-[#287A55]/30',
      icon: <Flame className="w-3.5 h-3.5 shrink-0 text-[#287A55]" aria-hidden="true" />,
    },
    'Saiu para entrega': {
      bg: 'bg-[#287A55]',
      text: 'text-white',
      border: 'border-[#287A55]',
      icon:
        deliveryMode === 'retirada' ? (
          <PackageCheck className="w-3.5 h-3.5 shrink-0 text-[#F4C95D]" aria-hidden="true" />
        ) : (
          <Bike className="w-3.5 h-3.5 shrink-0 text-[#F4C95D]" aria-hidden="true" />
        ),
    },
    Concluído: {
      bg: 'bg-[#F1F5F3]',
      text: 'text-[#263238]',
      border: 'border-[#D5E0DA]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#287A55]" aria-hidden="true" />,
    },
    Cancelado: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#991B1B]',
      border: 'border-[#FECACA]',
      icon: <XCircle className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" aria-hidden="true" />,
    },
  };

  const style = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold whitespace-nowrap shrink-0 ${style.bg} ${style.text} ${style.border}`}
    >
      {style.icon}
      <span>{label}</span>
    </span>
  );
};
