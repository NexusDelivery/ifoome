import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bike,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  MapPin,
  MessageCircle,
  QrCode,
  Store,
  Wallet,
} from 'lucide-react';
import {
  CartItem,
  DeliveryMode,
  Dish,
  Order,
  PaymentMethod,
  StoreConfig,
} from '../../types/ifoome';
import { formatCurrency, formatPhoneMask, formatTime } from '../../utils/formatters';
import { StatusIndicator } from '../StatusBadge';

interface CheckoutViewProps {
  cart: CartItem[];
  dishes: Dish[];
  storeConfig: StoreConfig;
  onBackToMenu: () => void;
  onSubmitOrder: (payload: {
    customerName: string;
    customerPhone: string;
    deliveryMode: DeliveryMode;
    street: string;
    number: string;
    neighborhood: string;
    complement: string;
    paymentMethod: PaymentMethod;
    changeFor?: number;
    generalObservation: string;
  }) => { ok: boolean; error?: string; order?: Order };
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  dishes,
  storeConfig,
  onBackToMenu,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('entrega');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [changeForInput, setChangeForInput] = useState('');
  const [generalObservation, setGeneralObservation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = deliveryMode === 'entrega' ? storeConfig.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const unavailableInCart = useMemo(() => {
    return cart.filter((item) => {
      const current = dishes.find((d) => d.id === item.dishId);
      return !current || !current.available;
    });
  }, [cart, dishes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedChange =
      paymentMethod === 'Dinheiro' && changeForInput.trim() !== ''
        ? Number(changeForInput.replace(',', '.'))
        : undefined;

    if (
      paymentMethod === 'Dinheiro' &&
      parsedChange !== undefined &&
      (Number.isNaN(parsedChange) || parsedChange < total)
    ) {
      setErrorMessage(
        `O valor para troco deve ser maior ou igual ao total do pedido (${formatCurrency(total)}).`
      );
      return;
    }

    const result = onSubmitOrder({
      customerName,
      customerPhone,
      deliveryMode,
      street,
      number,
      neighborhood,
      complement,
      paymentMethod,
      changeFor: parsedChange,
      generalObservation,
    });

    if (!result.ok && result.error) {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button
        type="button"
        onClick={onBackToMenu}
        className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 rounded-xl text-sm font-semibold text-[#287A55] hover:bg-[#DDEFE3]/60 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Voltar para o cardápio</span>
      </button>

      <div className="mt-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
          Finalizar Pedido
        </h1>
        <p className="mt-1 text-sm text-[#263238]/75">
          Não precisa criar conta. Preencha apenas o necessário para prepararmos sua marmita.
        </p>
      </div>

      {unavailableInCart.length > 0 && (
        <div
          role="alert"
          className="mt-5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3.5 text-sm text-[#991B1B]"
        >
          <p className="font-bold">Atenção: item indisponível no carrinho</p>
          <p className="mt-0.5">
            Os seguintes itens ficaram indisponíveis: {unavailableInCart.map((i) => i.name).join(', ')}. Volte ao cardápio para removê-los antes de enviar.
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3.5 text-sm font-medium text-[#991B1B]"
        >
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Coluna Esquerda: Formulário */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dados do Cliente */}
          <section className="bg-white rounded-2xl border border-[#DCE6E0] p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#263238]">1. Seus dados</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="customer-name"
                  className="block text-sm font-semibold text-[#263238] mb-1.5"
                >
                  Seu nome *
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex.: João da Silva"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-phone"
                  className="block text-sm font-semibold text-[#263238] mb-1.5"
                >
                  Telefone / WhatsApp *
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhoneMask(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm text-[#263238] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                />
              </div>
            </div>
          </section>

          {/* Modalidade: Entrega ou Retirada */}
          <section className="bg-white rounded-2xl border border-[#DCE6E0] p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#263238]">2. Entrega ou retirada</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMode('entrega')}
                className={`min-h-[56px] p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors ${
                  deliveryMode === 'entrega'
                    ? 'bg-[#DDEFE3]/70 border-[#287A55] text-[#263238]'
                    : 'bg-white border-[#DCE6E0] text-[#263238]/80 hover:bg-[#F6F9F7]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Bike className="w-5 h-5 text-[#287A55] shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="block text-sm font-bold">Receber em casa</strong>
                    <span className="text-xs text-[#263238]/70">
                      Taxa:{' '}
                      {storeConfig.deliveryFee > 0
                        ? formatCurrency(storeConfig.deliveryFee)
                        : 'Grátis'}
                    </span>
                  </span>
                </span>
                {deliveryMode === 'entrega' && (
                  <Check className="w-5 h-5 text-[#287A55] shrink-0" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMode('retirada')}
                className={`min-h-[56px] p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors ${
                  deliveryMode === 'retirada'
                    ? 'bg-[#DDEFE3]/70 border-[#287A55] text-[#263238]'
                    : 'bg-white border-[#DCE6E0] text-[#263238]/80 hover:bg-[#F6F9F7]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-[#287A55] shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="block text-sm font-bold">Retirar no balcão</strong>
                    <span className="text-xs text-[#287A55] font-semibold">Sem taxa</span>
                  </span>
                </span>
                {deliveryMode === 'retirada' && (
                  <Check className="w-5 h-5 text-[#287A55] shrink-0" aria-hidden="true" />
                )}
              </button>
            </div>

            {deliveryMode === 'entrega' ? (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-6 gap-4">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="addr-street"
                    className="block text-sm font-semibold text-[#263238] mb-1.5"
                  >
                    Rua / Avenida *
                  </label>
                  <input
                    id="addr-street"
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex.: Rua das Acácias"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="addr-number"
                    className="block text-sm font-semibold text-[#263238] mb-1.5"
                  >
                    Número *
                  </label>
                  <input
                    id="addr-number"
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex.: 120"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="addr-neighborhood"
                    className="block text-sm font-semibold text-[#263238] mb-1.5"
                  >
                    Bairro *
                  </label>
                  <input
                    id="addr-neighborhood"
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex.: Centro"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="addr-complement"
                    className="block text-sm font-semibold text-[#263238] mb-1.5"
                  >
                    Complemento / Referência
                  </label>
                  <input
                    id="addr-complement"
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Casa, apto ou ponto próximo"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#F6F9F7] border border-[#DCE6E0] p-4 flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-[#287A55] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#263238]">Endereço para retirada:</p>
                  <p className="text-[#263238]/75">{storeConfig.pickupAddress}</p>
                </div>
              </div>
            )}
          </section>

          {/* Forma de Pagamento */}
          <section className="bg-white rounded-2xl border border-[#DCE6E0] p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#263238]">
              3. Pagamento na {deliveryMode === 'entrega' ? 'entrega' : 'retirada'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Pix' as PaymentMethod, label: 'Pix', icon: QrCode },
                { id: 'Dinheiro' as PaymentMethod, label: 'Dinheiro', icon: Wallet },
                { id: 'Cartão' as PaymentMethod, label: 'Cartão', icon: CreditCard },
              ].map((option) => {
                const Icon = option.icon;
                const active = paymentMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`min-h-[48px] px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-[#DDEFE3]/70 border-[#287A55] text-[#1E6143]'
                        : 'bg-white border-[#DCE6E0] text-[#263238]/80 hover:bg-[#F6F9F7]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Dinheiro' && (
              <div className="pt-1">
                <label
                  htmlFor="change-for"
                  className="block text-sm font-semibold text-[#263238] mb-1.5"
                >
                  Precisa de troco para quanto? (opcional)
                </label>
                <input
                  id="change-for"
                  type="text"
                  inputMode="decimal"
                  value={changeForInput}
                  onChange={(e) => setChangeForInput(e.target.value)}
                  placeholder="Ex.: 50,00 ou 100,00"
                  className="w-full sm:w-64 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="general-obs"
                className="block text-sm font-semibold text-[#263238] mb-1.5"
              >
                Observação geral do pedido (opcional)
              </label>
              <textarea
                id="general-obs"
                rows={2}
                value={generalObservation}
                onChange={(e) => setGeneralObservation(e.target.value)}
                placeholder="Ex.: mandar talheres, tocar interfone..."
                className="w-full rounded-xl border border-[#DCE6E0] px-3.5 py-2.5 text-sm text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#287A55]"
              />
            </div>
          </section>
        </div>

        {/* Coluna Direita: Resumo do Pedido */}
        <aside className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE6E0] p-5 sm:p-6 lg:sticky lg:top-20 space-y-4">
          <h2 className="text-lg font-bold text-[#263238]">Resumo do pedido</h2>

          <ul className="divide-y divide-[#E6EFEA]">
            {cart.map((item, idx) => (
              <li key={`${item.dishId}-${idx}`} className="py-3 flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-[#263238]">
                    <span className="font-mono tabular-nums mr-1.5">{item.quantity}x</span>
                    {item.name}
                  </p>
                  {item.observation && (
                    <p className="text-xs text-[#263238]/65 mt-0.5">Obs.: {item.observation}</p>
                  )}
                </div>
                <span className="font-mono font-semibold text-[#263238] tabular-nums shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-[#E6EFEA] space-y-2 text-sm">
            <div className="flex justify-between text-[#263238]/75">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#263238]/75">
              <span>
                {deliveryMode === 'entrega' ? 'Taxa de entrega' : 'Retirada no balcão'}
              </span>
              <span className="font-mono tabular-nums">
                {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E6EFEA] flex justify-between text-base font-extrabold text-[#263238]">
              <span>Total a pagar</span>
              <span className="font-mono text-[#287A55] tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!storeConfig.isOpen || cart.length === 0 || unavailableInCart.length > 0}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] disabled:bg-[#DCE6E0] disabled:text-[#263238]/45 transition-colors"
          >
            Confirmar e enviar pedido
          </button>
        </aside>
      </form>
    </div>
  );
};

interface OrderConfirmationViewProps {
  order: Order;
  storeConfig: StoreConfig;
  onTrackOrders: () => void;
  onBackToMenu: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  storeConfig,
  onTrackOrders,
  onBackToMenu,
}) => {
  const [copied, setCopied] = useState(false);

  const summaryText = useMemo(() => {
    const lines = [
      `*Pedido ${order.code}* — ${storeConfig.name}`,
      `Cliente: ${order.customerName} (${order.customerPhone})`,
      `Modalidade: ${order.deliveryMode === 'entrega' ? 'Entrega' : 'Retirada no balcão'}`,
    ];
    if (order.deliveryMode === 'entrega' && order.address) {
      lines.push(
        `Endereço: ${order.address.street}, ${order.address.number} - ${order.address.neighborhood}${
          order.address.complement ? ` (${order.address.complement})` : ''
        }`
      );
    }
    lines.push('Itens:');
    order.items.forEach((item) => {
      lines.push(
        `- ${item.quantity}x ${item.name} (${formatCurrency(item.unitPrice * item.quantity)})${
          item.observation ? ` [Obs: ${item.observation}]` : ''
        }`
      );
    });
    lines.push(`Pagamento: ${order.paymentMethod}${order.changeFor ? ` (Troco p/ ${formatCurrency(order.changeFor)})` : ''}`);
    lines.push(`Total: ${formatCurrency(order.total)}`);
    return lines.join('\n');
  }, [order, storeConfig.name]);

  const phoneDigits = storeConfig.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(summaryText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white rounded-2xl border border-[#DCE6E0] p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DDEFE3] text-[#287A55] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#287A55]">
              Pedido registrado às {formatTime(order.createdAt)}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263238] mt-0.5">
              Pedido <span className="font-mono tabular-nums">{order.code}</span> recebido
            </h1>
            <p className="mt-1.5 text-sm text-[#263238]/75">
              Já enviamos seu pedido para a cozinha de {storeConfig.name}. Previsão: {storeConfig.estimatedTime}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 rounded-xl bg-[#F6F9F7] border border-[#E6EFEA]">
          <span className="text-sm font-semibold text-[#263238]">Status atual:</span>
          <StatusIndicator status={order.status} deliveryMode={order.deliveryMode} />
        </div>

        <div className="space-y-3 text-sm">
          <h2 className="font-bold text-[#263238]">Itens do pedido</h2>
          <ul className="divide-y divide-[#E6EFEA]">
            {order.items.map((item, idx) => (
              <li key={idx} className="py-2.5 flex justify-between gap-3">
                <span>
                  <strong className="font-mono tabular-nums mr-1.5">{item.quantity}x</strong>
                  {item.name}
                  {item.observation && (
                    <span className="block text-xs text-[#263238]/65">
                      Obs.: {item.observation}
                    </span>
                  )}
                </span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-[#E6EFEA] space-y-1.5">
            <div className="flex justify-between text-[#263238]/75">
              <span>Modalidade</span>
              <span className="font-medium text-[#263238]">
                {order.deliveryMode === 'entrega' ? 'Entrega' : 'Retirada no balcão'}
              </span>
            </div>
            {order.deliveryMode === 'entrega' && order.address && (
              <div className="flex justify-between gap-4 text-[#263238]/75">
                <span>Endereço</span>
                <span className="text-right text-[#263238]">
                  {order.address.street}, {order.address.number} · {order.address.neighborhood}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#263238]/75">
              <span>Pagamento</span>
              <span className="font-medium text-[#263238]">
                {order.paymentMethod}
                {order.changeFor ? ` (troco p/ ${formatCurrency(order.changeFor)})` : ''}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E6EFEA] flex justify-between text-base font-extrabold text-[#263238]">
              <span>Total</span>
              <span className="font-mono text-[#287A55] tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {phoneDigits.length >= 10 && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Enviar resumo no WhatsApp</span>
            </a>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DCE6E0] bg-white text-sm font-semibold text-[#263238] hover:bg-[#F6F9F7] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
            <span>{copied ? 'Resumo copiado!' : 'Copiar resumo'}</span>
          </button>
        </div>

        <div className="pt-2 border-t border-[#E6EFEA] flex flex-col sm:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={onTrackOrders}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#DDEFE3] text-[#1E6143] text-sm font-semibold hover:bg-[#CCE6D5] transition-colors"
          >
            Acompanhar status do pedido
          </button>
          <button
            type="button"
            onClick={onBackToMenu}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-[#263238]/75 hover:text-[#263238]"
          >
            Voltar ao cardápio
          </button>
        </div>
      </div>
    </div>
  );
};

interface OrderTrackingViewProps {
  orders: Order[];
  onBackToMenu: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  onBackToMenu,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button
        type="button"
        onClick={onBackToMenu}
        className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 rounded-xl text-sm font-semibold text-[#287A55] hover:bg-[#DDEFE3]/60 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Voltar ao cardápio</span>
      </button>

      <div className="mt-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263238]">
          Acompanhamento de Pedidos
        </h1>
        <p className="mt-1 text-sm text-[#263238]/75">
          Acompanhe em tempo real o andamento dos pedidos (inclusive exemplos de demonstração e novos pedidos feitos nesta sessão).
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-[#DCE6E0] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#263238]/65">
                <span className="font-mono font-bold text-sm text-[#263238] tabular-nums">
                  {order.code}
                </span>
                <span aria-hidden="true">·</span>
                <span>{formatTime(order.createdAt)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {order.deliveryMode === 'entrega' ? 'Entrega' : 'Retirada no balcão'}
                </span>
                {order.isDemo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Exemplo demonstrativo</span>
                  </>
                )}
              </div>
              <p className="text-sm font-semibold text-[#263238]">{order.customerName}</p>
              <p className="text-xs text-[#263238]/75">
                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
              <StatusIndicator status={order.status} deliveryMode={order.deliveryMode} />
              <span className="font-mono text-sm font-bold text-[#263238] tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
