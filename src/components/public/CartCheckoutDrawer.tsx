import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  CartItem,
  DeliveryType,
  MenuItem,
  Order,
  PaymentMethod,
  StoreConfig,
} from '../../types';
import {
  buildWhatsAppOrderUrl,
  formatCurrency,
  getDigitsCount,
} from '../../utils/format';
import { StatusBadge } from '../StatusBadge';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: StoreConfig;
  menuItems: MenuItem[];
  cart: CartItem[];
  onUpdateCartItemQty: (index: number, delta: number) => void;
  onRemoveCartItem: (index: number) => void;
  onCreateOrder: (
    orderInput: Omit<Order, 'id' | 'code' | 'createdAt' | 'status'>
  ) => Order;
  onClearCart: () => void;
}

type DrawerStep = 'cart' | 'checkout' | 'confirmed';

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  storeConfig,
  menuItems,
  cart,
  onUpdateCartItemQty,
  onRemoveCartItem,
  onCreateOrder,
  onClearCart,
}) => {
  const [step, setStep] = useState<DrawerStep>('cart');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Campos do formulário de finalização
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('Entrega');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [changeForInput, setChangeForInput] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const subtotal = useMemo(
    () =>
      cart.reduce((acc, item) => {
        const liveDish = menuItems.find((m) => m.id === item.menuItem.id);
        const unitPrice = liveDish ? liveDish.price : item.menuItem.price;
        return acc + unitPrice * item.quantity;
      }, 0),
    [cart, menuItems]
  );

  const deliveryFee = deliveryType === 'Entrega' ? storeConfig.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  if (!isOpen) return null;

  const handleClose = () => {
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
    }
    setFormErrors([]);
    onClose();
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!storeConfig.isOpen) {
      errors.push('A loja foi fechada no momento e não está recebendo novos pedidos.');
    }
    if (cart.length === 0) {
      errors.push('Sua sacola está vazia. Adicione ao menos um prato.');
    }

    // Verifica disponibilidade atual no cardápio (RN-01 / RN-04)
    const unavailableNames: string[] = [];
    cart.forEach((cartItem) => {
      const liveItem = menuItems.find((m) => m.id === cartItem.menuItem.id);
      if (!liveItem || !liveItem.available) {
        unavailableNames.push(cartItem.menuItem.name);
      }
    });
    if (unavailableNames.length > 0) {
      errors.push(
        `Os seguintes itens ficaram indisponíveis: ${unavailableNames.join(', ')}. Remova-os da sacola para continuar.`
      );
    }

    if (!customerName.trim()) {
      errors.push('Informe seu nome.');
    }
    if (getDigitsCount(customerPhone) < 10) {
      errors.push('Informe um telefone ou WhatsApp válido com DDD (mínimo 10 dígitos).');
    }

    if (deliveryType === 'Entrega') {
      if (!street.trim()) errors.push('Informe a rua ou avenida para entrega.');
      if (!number.trim()) errors.push('Informe o número do endereço.');
      if (!neighborhood.trim()) errors.push('Informe o bairro para entrega.');
    }

    let parsedChangeFor: number | undefined;
    if (paymentMethod === 'Dinheiro' && changeForInput.trim()) {
      const normalized = Number(changeForInput.replace(',', '.'));
      if (Number.isNaN(normalized) || normalized < total) {
        errors.push(
          `O valor para troco deve ser maior ou igual ao total do pedido (${formatCurrency(total)}).`
        );
      } else {
        parsedChangeFor = normalized;
      }
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    // Recalcula snapshot pelos preços vigentes (RN-04)
    const snapshotItems = cart.map((c) => {
      const live = menuItems.find((m) => m.id === c.menuItem.id) ?? c.menuItem;
      return {
        menuItemId: live.id,
        name: live.name,
        unitPrice: live.price,
        quantity: c.quantity,
        notes: c.notes,
      };
    });

    const computedSubtotal = snapshotItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const computedDeliveryFee = deliveryType === 'Entrega' ? storeConfig.deliveryFee : 0;

    const newOrder = onCreateOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      address:
        deliveryType === 'Entrega'
          ? {
              street: street.trim(),
              number: number.trim(),
              neighborhood: neighborhood.trim(),
              complement: complement.trim() || undefined,
            }
          : undefined,
      paymentMethod,
      changeFor: parsedChangeFor,
      items: snapshotItems,
      subtotal: computedSubtotal,
      deliveryFee: computedDeliveryFee,
      total: computedSubtotal + computedDeliveryFee,
      generalNotes: generalNotes.trim() || undefined,
    });

    setConfirmedOrder(newOrder);
    onClearCart();
    setFormErrors([]);
    setStep('confirmed');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Sacola e finalização de pedido"
    >
      <div className="w-full max-w-lg bg-white h-full flex flex-col border-l border-[#E7E3DD]">
        {/* Cabeçalho do Drawer */}
        <div className="px-5 py-4 border-b border-[#E7E3DD] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => {
                  setFormErrors([]);
                  setStep('cart');
                }}
                className="min-w-[44px] min-h-[44px] -ml-2 rounded-xl flex items-center justify-center text-[#4A423E] hover:bg-[#F1EFEA] cursor-pointer"
                aria-label="Voltar para a sacola"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-display text-lg font-bold text-[#26201D]">
              {step === 'cart' && 'Sua sacola'}
              {step === 'checkout' && 'Finalizar pedido'}
              {step === 'confirmed' && 'Pedido confirmado'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] -mr-2 rounded-xl flex items-center justify-center text-[#4A423E] hover:bg-[#F1EFEA] cursor-pointer"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ETAPA 1: SACOLA */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag
                    className="w-10 h-10 text-[#C9C2BA] mx-auto mb-3"
                    aria-hidden="true"
                  />
                  <p className="font-display text-lg font-bold text-[#26201D]">
                    Sua sacola está vazia
                  </p>
                  <p className="text-sm text-[#665D58] mt-1 max-w-xs mx-auto">
                    Escolha seus pratos no cardápio para montar o pedido.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D94E1F] text-white text-sm font-semibold cursor-pointer"
                  >
                    Ver cardápio
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ul className="divide-y divide-[#F1EFEA]">
                    {cart.map((item, idx) => {
                      const live = menuItems.find((m) => m.id === item.menuItem.id);
                      const isUnavailable = !live || !live.available;
                      const unitPrice = live ? live.price : item.menuItem.price;
                      return (
                        <li key={`${item.menuItem.id}-${idx}`} className="py-4 first:pt-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#26201D]">
                                {item.menuItem.name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-[#665D58] mt-0.5">
                                  Obs.: {item.notes}
                                </p>
                              )}
                              {isUnavailable && (
                                <p className="text-xs font-semibold text-[#991B1B] mt-1">
                                  Item indisponível no momento — remova para continuar.
                                </p>
                              )}
                              <p className="font-mono tabular-nums text-sm font-semibold text-[#D94E1F] mt-1">
                                {formatCurrency(unitPrice * item.quantity)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <div className="inline-flex items-center rounded-xl border border-[#DDD7CF] bg-[#F8F7F4]">
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartItemQty(idx, -1)}
                                  className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-[#EFECE6] rounded-l-xl cursor-pointer"
                                  aria-label={`Diminuir ${item.menuItem.name}`}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-mono tabular-nums text-xs font-bold px-2">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartItemQty(idx, 1)}
                                  className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-[#EFECE6] rounded-r-xl cursor-pointer"
                                  aria-label={`Aumentar ${item.menuItem.name}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => onRemoveCartItem(idx)}
                                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#665D58] hover:text-[#991B1B] rounded-xl cursor-pointer"
                                aria-label={`Remover ${item.menuItem.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* ETAPA 2: FORMULÁRIO DE FINALIZAÇÃO */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-5">
              {formErrors.length > 0 && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3.5 text-sm text-[#991B1B]"
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Verifique os dados antes de enviar:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs">
                    {formErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dados do Cliente */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-bold text-[#26201D]">
                  1. Seus dados
                </h3>
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-xs font-semibold text-[#4A423E] mb-1"
                  >
                    Nome completo *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex.: Maria Oliveira"
                    className="w-full min-h-[44px] rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm focus:outline-2 focus:outline-[#D94E1F]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer-phone"
                    className="block text-xs font-semibold text-[#4A423E] mb-1"
                  >
                    Telefone / WhatsApp *
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full min-h-[44px] rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm font-mono focus:outline-2 focus:outline-[#D94E1F]"
                  />
                </div>
              </div>

              {/* Modalidade: Entrega vs Retirada */}
              <div className="space-y-3 pt-2 border-t border-[#F1EFEA]">
                <h3 className="font-display text-sm font-bold text-[#26201D]">
                  2. Entrega ou retirada
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Entrega')}
                    className={`min-h-[48px] px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                      deliveryType === 'Entrega'
                        ? 'border-[#D94E1F] bg-[#D94E1F]/8 text-[#26201D]'
                        : 'border-[#DDD7CF] bg-white text-[#4A423E]'
                    }`}
                  >
                    <span className="block text-sm font-bold">Entrega</span>
                    <span className="block text-xs text-[#665D58] font-mono tabular-nums">
                      {storeConfig.deliveryFee > 0
                        ? formatCurrency(storeConfig.deliveryFee)
                        : 'Grátis'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('Retirada')}
                    className={`min-h-[48px] px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                      deliveryType === 'Retirada'
                        ? 'border-[#D94E1F] bg-[#D94E1F]/8 text-[#26201D]'
                        : 'border-[#DDD7CF] bg-white text-[#4A423E]'
                    }`}
                  >
                    <span className="block text-sm font-bold">Retirar no local</span>
                    <span className="block text-xs text-[#166534] font-semibold">
                      Grátis
                    </span>
                  </button>
                </div>

                {deliveryType === 'Entrega' ? (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label
                        htmlFor="addr-street"
                        className="block text-xs font-semibold text-[#4A423E] mb-1"
                      >
                        Rua / Avenida *
                      </label>
                      <input
                        id="addr-street"
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Ex.: Rua das Flores"
                        className="w-full min-h-[44px] rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm focus:outline-2 focus:outline-[#D94E1F]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-1">
                        <label
                          htmlFor="addr-number"
                          className="block text-xs font-semibold text-[#4A423E] mb-1"
                        >
                          Número *
                        </label>
                        <input
                          id="addr-number"
                          type="text"
                          required
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          placeholder="123"
                          className="w-full min-h-[44px] rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm focus:outline-2 focus:outline-[#D94E1F]"
                        />
                      </div>
                      <div className="col-span-2">
                        <label
                          htmlFor="addr-neighborhood"
                          className="block text-xs font-semibold text-[#4A423E] mb-1"
                        >
                          Bairro *
                        </label>
                        <input
                          id="addr-neighborhood"
                          type="text"
                          required
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="Centro"
                          className="w-full min-h-[44px] rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm focus:outline-2 focus:outline-[#D94E1F]"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="addr-comp"
                        className="block text-xs font-semibold text-[#4A423E] mb-1"
                      >
                        Complemento / Ponto de referência (opcional)
                      </label>
                      <input
                        id="addr-comp"
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Ex.: Portão azul, próximo à padaria"
                        className="w-full min-h-[44px] rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm focus:outline-2 focus:outline-[#D94E1F]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F8F7F4] border border-[#E7E3DD] p-3 text-xs text-[#4A423E]">
                    <p className="font-semibold text-[#26201D]">Local de retirada:</p>
                    <p className="mt-0.5">{storeConfig.address}</p>
                  </div>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-3 pt-2 border-t border-[#F1EFEA]">
                <h3 className="font-display text-sm font-bold text-[#26201D]">
                  3. Pagamento na {deliveryType === 'Entrega' ? 'entrega' : 'retirada'}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pix', 'Dinheiro', 'Cartão'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                        paymentMethod === method
                          ? 'border-[#D94E1F] bg-[#D94E1F]/8 text-[#D94E1F]'
                          : 'border-[#DDD7CF] bg-white text-[#4A423E]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'Dinheiro' && (
                  <div>
                    <label
                      htmlFor="change-for"
                      className="block text-xs font-semibold text-[#4A423E] mb-1"
                    >
                      Precisa de troco para quanto? (opcional)
                    </label>
                    <input
                      id="change-for"
                      type="text"
                      inputMode="decimal"
                      value={changeForInput}
                      onChange={(e) => setChangeForInput(e.target.value)}
                      placeholder="Ex.: 50,00"
                      className="w-full min-h-[44px] rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm font-mono focus:outline-2 focus:outline-[#D94E1F]"
                    />
                  </div>
                )}
              </div>

              {/* Observação Geral */}
              <div className="pt-2 border-t border-[#F1EFEA]">
                <label
                  htmlFor="general-notes"
                  className="block text-xs font-semibold text-[#4A423E] mb-1"
                >
                  Observação geral do pedido (opcional)
                </label>
                <textarea
                  id="general-notes"
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Ex.: Enviar talheres descartáveis, interfone com defeito..."
                  className="w-full rounded-xl border border-[#DDD7CF] px-3.5 py-2 text-sm focus:outline-2 focus:outline-[#D94E1F]"
                />
              </div>
            </form>
          )}

          {/* ETAPA 3: CONFIRMAÇÃO */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="space-y-5 py-2">
              <div className="rounded-2xl bg-[#DCFCE7]/50 border border-[#BBF7D0] p-5 text-center">
                <CheckCircle2
                  className="w-10 h-10 text-[#166534] mx-auto mb-2"
                  aria-hidden="true"
                />
                <p className="font-mono tabular-nums text-xs font-bold text-[#166534]">
                  Pedido {confirmedOrder.code}
                </p>
                <h3 className="font-display text-xl font-bold text-[#26201D] mt-1">
                  Recebemos seu pedido!
                </h3>
                <p className="text-sm text-[#4A423E] mt-1">
                  O restaurante já pode acompanhar seu pedido no painel da cozinha.
                </p>
                <div className="mt-3 flex justify-center">
                  <StatusBadge
                    status={confirmedOrder.status}
                    deliveryType={confirmedOrder.deliveryType}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E7E3DD] p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#665D58]">Cliente</span>
                  <span className="font-semibold text-[#26201D]">
                    {confirmedOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#665D58]">Modalidade</span>
                  <span className="font-semibold text-[#26201D]">
                    {confirmedOrder.deliveryType === 'Entrega'
                      ? 'Entrega'
                      : 'Retirada no local'}
                  </span>
                </div>
                {confirmedOrder.address && (
                  <div className="text-xs text-[#4A423E] bg-[#F8F7F4] p-2.5 rounded-lg">
                    {confirmedOrder.address.street}, {confirmedOrder.address.number} —{' '}
                    {confirmedOrder.address.neighborhood}
                    {confirmedOrder.address.complement
                      ? ` (${confirmedOrder.address.complement})`
                      : ''}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#665D58]">Pagamento</span>
                  <span className="font-semibold text-[#26201D]">
                    {confirmedOrder.paymentMethod}
                    {confirmedOrder.changeFor
                      ? ` (troco p/ ${formatCurrency(confirmedOrder.changeFor)})`
                      : ''}
                  </span>
                </div>

                <div className="border-t border-[#F1EFEA] pt-3 space-y-1.5">
                  {confirmedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-[#26201D]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-mono tabular-nums font-semibold">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#F1EFEA] pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="font-mono tabular-nums text-[#D94E1F]">
                    {formatCurrency(confirmedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <a
                  href={buildWhatsAppOrderUrl(confirmedOrder, storeConfig.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#287A55] hover:bg-[#1F6143] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Enviar resumo no WhatsApp</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DDD7CF] bg-white hover:bg-[#F8F7F4] text-[#26201D] text-sm font-semibold cursor-pointer"
                >
                  Voltar ao cardápio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Drawer (Resumo e Botão Principal) */}
        {step === 'cart' && cart.length > 0 && (
          <div className="p-5 border-t border-[#E7E3DD] bg-[#F8F7F4] space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#665D58]">Subtotal dos itens</span>
              <span className="font-mono tabular-nums font-bold text-[#26201D]">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-xs text-[#665D58]">
              Taxa de entrega (se aplicável) será calculada na próxima etapa.
            </p>
            <button
              type="button"
              disabled={!storeConfig.isOpen}
              onClick={() => setStep('checkout')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#D94E1F] hover:bg-[#BE4117] disabled:bg-[#DDD7CF] disabled:text-[#665D58] text-white text-sm font-bold transition-colors cursor-pointer"
            >
              {storeConfig.isOpen ? 'Continuar para entrega e pagamento' : 'Loja fechada no momento'}
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="p-5 border-t border-[#E7E3DD] bg-[#F8F7F4] space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[#665D58]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#665D58]">
                <span>{deliveryType === 'Entrega' ? 'Taxa de entrega' : 'Retirada no balcão'}</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base text-[#26201D] pt-1 border-t border-[#E7E3DD]">
                <span>Total final</span>
                <span className="font-mono tabular-nums text-[#D94E1F]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#D94E1F] hover:bg-[#BE4117] text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
