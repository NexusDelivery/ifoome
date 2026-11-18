import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CreditCard,
  MapPin,
  QrCode,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import {
  CartItem,
  DeliveryModality,
  Order,
  PaymentMethod,
  Product,
  StoreSettings,
} from '../../types';
import { formatCurrency, formatPhoneMask } from '../../utils/format';

interface CheckoutViewProps {
  cart: CartItem[];
  catalogProducts: Product[];
  store: StoreSettings;
  onBackToMenu: () => void;
  onRemoveCartItem: (index: number) => void;
  onSubmitOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    modality: DeliveryModality;
    address?: {
      street: string;
      number: string;
      neighborhood: string;
      complement?: string;
    };
    paymentMethod: PaymentMethod;
    changeFor?: number;
    generalObservation?: string;
  }) => { ok: boolean; error?: string; order?: Order };
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  catalogProducts,
  store,
  onBackToMenu,
  onRemoveCartItem,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [modality, setModality] = useState<DeliveryModality>('entrega');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [changeText, setChangeText] = useState('');
  const [generalObservation, setGeneralObservation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => {
    const liveProduct = catalogProducts.find((p) => p.id === item.product.id);
    const price = liveProduct ? liveProduct.price : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = modality === 'entrega' ? store.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const unavailableItems = cart.filter((item) => {
    const live = catalogProducts.find((p) => p.id === item.product.id);
    return !live || !live.available;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!store.isOpen) {
      setErrorMsg('O restaurante está fechado no momento e não aceita novos pedidos.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Sua sacola está vazia. Adicione ao menos um prato.');
      return;
    }
    if (unavailableItems.length > 0) {
      setErrorMsg(
        `O item "${unavailableItems[0].product.name}" ficou indisponível. Remova-o para continuar.`
      );
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Informe seu nome para identificarmos o pedido.');
      return;
    }
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMsg('Informe um telefone ou WhatsApp válido com DDD (10 ou 11 dígitos).');
      return;
    }
    if (modality === 'entrega') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setErrorMsg('Preencha rua, número e bairro para a entrega.');
        return;
      }
    }

    let parsedChange: number | undefined;
    if (paymentMethod === 'Dinheiro' && changeText.trim()) {
      const val = Number(changeText.replace(',', '.'));
      if (Number.isNaN(val) || val < total) {
        setErrorMsg(
          `O valor para troco deve ser maior ou igual ao total (${formatCurrency(total)}).`
        );
        return;
      }
      parsedChange = Math.round(val * 100) / 100;
    }

    const result = onSubmitOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      modality,
      address:
        modality === 'entrega'
          ? {
              street: street.trim(),
              number: number.trim(),
              neighborhood: neighborhood.trim(),
              complement: complement.trim() || undefined,
            }
          : undefined,
      paymentMethod,
      changeFor: parsedChange,
      generalObservation: generalObservation.trim() || undefined,
    });

    if (!result.ok && result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToMenu}
          className="min-h-[44px] px-3 py-2 -ml-3 rounded-xl text-sm font-semibold text-[#382B25] hover:bg-[#F7EFE5] inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#F47B35]" aria-hidden="true" />
          <span>Voltar ao cardápio</span>
        </button>
        <span className="text-xs font-medium text-[#6E5D55]">{store.name}</span>
      </div>

      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#382B25]">
          Finalizar Pedido
        </h1>
        <p className="text-sm text-[#6E5D55] mt-1">
          Não precisa de cadastro. Preencha seus dados para enviar direto para a cozinha.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl bg-[#FDECE9] border border-[#FECDCA] text-sm font-medium text-[#B42318]"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {unavailableItems.length > 0 && (
        <div
          role="alert"
          className="px-4 py-3.5 rounded-xl bg-[#FFF3E6] border border-[#F47B35]/40 text-sm text-[#B54708] space-y-2"
        >
          <p className="font-semibold">
            Um ou mais itens do seu carrinho ficaram indisponíveis:
          </p>
          <ul className="space-y-1">
            {unavailableItems.map((item) => {
              const idx = cart.findIndex((c) => c.product.id === item.product.id);
              return (
                <li key={item.product.id} className="flex items-center justify-between gap-3">
                  <span>{item.product.name}</span>
                  <button
                    type="button"
                    onClick={() => idx >= 0 && onRemoveCartItem(idx)}
                    className="text-xs font-bold underline text-[#B42318]"
                  >
                    Remover item
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Seus dados */}
          <section className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 space-y-4">
            <h2 className="font-display font-bold text-lg text-[#382B25]">
              1. Seus dados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-semibold text-[#382B25] mb-1.5"
                >
                  Nome completo *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex.: Ana Paula Silva"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold text-[#382B25] mb-1.5"
                >
                  Telefone / WhatsApp *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhoneMask(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
              </div>
            </div>
          </section>

          {/* 2. Entrega ou Retirada */}
          <section className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 space-y-4">
            <h2 className="font-display font-bold text-lg text-[#382B25]">
              2. Como deseja receber?
            </h2>

            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Modalidade de recebimento">
              <button
                type="button"
                role="radio"
                aria-checked={modality === 'entrega'}
                onClick={() => setModality('entrega')}
                className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                  modality === 'entrega'
                    ? 'bg-[#FFF3E6] border-[#F47B35] text-[#382B25]'
                    : 'bg-[#FFFFFF] border-[#DDD2C6] text-[#6E5D55] hover:bg-[#FFF8EF]'
                }`}
              >
                <Truck
                  className={`w-5 h-5 shrink-0 ${
                    modality === 'entrega' ? 'text-[#D94B3D]' : 'text-[#8E7D74]'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-sm font-bold text-[#382B25]">Entrega</span>
                  <span className="block text-xs text-[#6E5D55] tabular-nums">
                    {store.deliveryFee === 0
                      ? 'Grátis'
                      : `Taxa ${formatCurrency(store.deliveryFee)}`}
                  </span>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={modality === 'retirada'}
                onClick={() => setModality('retirada')}
                className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                  modality === 'retirada'
                    ? 'bg-[#FFF3E6] border-[#F47B35] text-[#382B25]'
                    : 'bg-[#FFFFFF] border-[#DDD2C6] text-[#6E5D55] hover:bg-[#FFF8EF]'
                }`}
              >
                <ShoppingBag
                  className={`w-5 h-5 shrink-0 ${
                    modality === 'retirada' ? 'text-[#D94B3D]' : 'text-[#8E7D74]'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-sm font-bold text-[#382B25]">Retirada</span>
                  <span className="block text-xs text-[#027A48] font-semibold">
                    Grátis no local
                  </span>
                </div>
              </button>
            </div>

            {modality === 'entrega' ? (
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 pt-1">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="addr-street"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="addr-number"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="addr-neighborhood"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="addr-complement"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
                  >
                    Complemento / Referência
                  </label>
                  <input
                    id="addr-complement"
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto, bloco, portão..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FFF8EF] border border-[#EAE0D5] text-sm text-[#57473F]">
                <MapPin className="w-4 h-4 text-[#F47B35] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-[#382B25]">Endereço para retirada: </span>
                  <span>{store.address}</span>
                </div>
              </div>
            )}
          </section>

          {/* 3. Forma de pagamento */}
          <section className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-[#382B25]">
                3. Forma de pagamento
              </h2>
              <p className="text-xs text-[#6E5D55] mt-0.5">
                Pagamento presencial na entrega ou retirada.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Forma de pagamento">
              {(
                [
                  { id: 'Pix', label: 'Pix', Icon: QrCode },
                  { id: 'Dinheiro', label: 'Dinheiro', Icon: Banknote },
                  { id: 'Cartão', label: 'Cartão', Icon: CreditCard },
                ] as const
              ).map(({ id, label, Icon }) => {
                const selected = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPaymentMethod(id)}
                    className={`min-h-[52px] px-3 py-2.5 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
                      selected
                        ? 'bg-[#FFF3E6] border-[#F47B35] text-[#382B25]'
                        : 'bg-[#FFFFFF] border-[#DDD2C6] text-[#6E5D55] hover:bg-[#FFF8EF]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        selected ? 'text-[#D94B3D]' : 'text-[#8E7D74]'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Dinheiro' && (
              <div>
                <label
                  htmlFor="checkout-change"
                  className="block text-xs font-semibold text-[#382B25] mb-1.5"
                >
                  Precisa de troco para quanto? (opcional)
                </label>
                <input
                  id="checkout-change"
                  type="text"
                  inputMode="decimal"
                  value={changeText}
                  onChange={(e) => setChangeText(e.target.value)}
                  placeholder="Ex.: 50,00 ou 100,00"
                  className="w-full sm:w-56 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="checkout-obs"
                className="block text-xs font-semibold text-[#382B25] mb-1.5"
              >
                Observação geral do pedido (opcional)
              </label>
              <textarea
                id="checkout-obs"
                rows={2}
                value={generalObservation}
                onChange={(e) => setGeneralObservation(e.target.value)}
                placeholder="Ex.: Enviar talheres descartáveis, tocar interfone 12..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
              />
            </div>
          </section>
        </div>

        {/* Resumo Lateral do Pedido */}
        <aside className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 space-y-4 lg:sticky lg:top-20">
          <h2 className="font-display font-bold text-lg text-[#382B25]">
            Resumo do Pedido
          </h2>

          <ul className="divide-y divide-[#F2EAE0]">
            {cart.map((item, idx) => {
              const liveProduct = catalogProducts.find((p) => p.id === item.product.id);
              const price = liveProduct ? liveProduct.price : item.product.price;
              return (
                <li key={`${item.product.id}-${idx}`} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#382B25]">
                      {item.quantity}x {item.product.name}
                    </p>
                    {item.observation && (
                      <p className="text-xs text-[#6E5D55] mt-0.5">
                        Obs: {item.observation}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-[#382B25] tabular-nums shrink-0">
                    {formatCurrency(price * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="pt-3 border-t border-[#EAE0D5] space-y-2 text-sm">
            <div className="flex justify-between text-[#6E5D55]">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6E5D55]">
              <span>Taxa de entrega</span>
              <span className="tabular-nums">
                {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[#F2EAE0]">
              <span className="font-display font-bold text-base text-[#382B25]">Total</span>
              <span className="font-display font-extrabold text-2xl text-[#D94B3D] tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!store.isOpen || cart.length === 0 || unavailableItems.length > 0}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] disabled:bg-[#DDD2C6] disabled:text-[#6E5D55] text-white font-semibold text-base transition-colors"
          >
            Confirmar Pedido
          </button>
        </aside>
      </form>
    </div>
  );
};
