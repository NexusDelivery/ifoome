import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bike,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShoppingBag,
  Trash2,
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

interface SyncedCartItem extends CartItem {
  isUnavailable?: boolean;
}

interface CheckoutViewProps {
  cart: SyncedCartItem[];
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
  const [changeForText, setChangeForText] = useState('');
  const [generalObservation, setGeneralObservation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const enrichedCart = cart.map((item) => {
    const liveProduct = catalogProducts.find((p) => p.id === item.product.id);
    const unavailable =
      item.isUnavailable || !liveProduct || !liveProduct.available;
    return {
      ...item,
      product: liveProduct ?? item.product,
      unavailable,
    };
  });

  const hasUnavailableItems = enrichedCart.some((item) => item.unavailable);
  const subtotal = enrichedCart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const deliveryFee = modality === 'entrega' ? store.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!store.isOpen) {
      setErrorMsg('O restaurante está fechado no momento.');
      return;
    }

    if (enrichedCart.length === 0) {
      setErrorMsg('Sua sacola está vazia. Adicione pelo menos um item.');
      return;
    }

    if (hasUnavailableItems) {
      setErrorMsg('Remova os itens indisponíveis da sacola antes de finalizar.');
      return;
    }

    if (customerName.trim().length < 2) {
      setErrorMsg('Informe seu nome para identificarmos o pedido.');
      return;
    }

    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setErrorMsg('Informe um telefone/WhatsApp válido com DDD (10 ou 11 dígitos).');
      return;
    }

    if (modality === 'entrega') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setErrorMsg('Preencha Rua, Número e Bairro para entrega.');
        return;
      }
    }

    let parsedChangeFor: number | undefined;
    if (paymentMethod === 'Dinheiro' && changeForText.trim() !== '') {
      const val = Number(changeForText.replace(',', '.'));
      if (Number.isNaN(val) || val < total) {
        setErrorMsg(
          `Se precisar de troco, o valor informado deve ser maior ou igual ao total (${formatCurrency(total)}).`
        );
        return;
      }
      parsedChangeFor = Math.round(val * 100) / 100;
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
      changeFor: parsedChangeFor,
      generalObservation: generalObservation.trim() || undefined,
    });

    if (!result.ok) {
      setErrorMsg(result.error ?? 'Não foi possível concluir o pedido.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToMenu}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] bg-[#FFFFFF] hover:bg-[#FFF8EF] text-sm font-semibold text-[#382B25] inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#F47B35]" aria-hidden="true" />
          <span>Voltar ao cardápio</span>
        </button>

        <h1 className="font-display font-bold text-xl sm:text-2xl text-[#382B25]">
          Finalizar Pedido
        </h1>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl bg-[#FDECE9] border border-[#FECDCA] text-sm font-medium text-[#B42318]"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Coluna Esquerda: Formulário */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dados do Cliente */}
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
                  Seu nome *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex.: Maria Clara"
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
                  placeholder="(11) 98765-4321"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
              </div>
            </div>
          </section>

          {/* Modalidade */}
          <section className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 space-y-4">
            <h2 className="font-display font-bold text-lg text-[#382B25]">
              2. Como deseja receber?
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModality('entrega')}
                className={`min-h-[56px] px-4 py-3 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                  modality === 'entrega'
                    ? 'border-[#F47B35] bg-[#FFF3E6] text-[#382B25]'
                    : 'border-[#DDD2C6] bg-[#FFFFFF] text-[#6E5D55] hover:bg-[#FFF8EF]'
                }`}
              >
                <Bike
                  className={`w-5 h-5 shrink-0 ${
                    modality === 'entrega' ? 'text-[#D94B3D]' : 'text-[#8E7D74]'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-sm font-bold">Entrega</span>
                  <span className="block text-xs tabular-nums">
                    {store.deliveryFee === 0
                      ? 'Grátis'
                      : formatCurrency(store.deliveryFee)}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setModality('retirada')}
                className={`min-h-[56px] px-4 py-3 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                  modality === 'retirada'
                    ? 'border-[#F47B35] bg-[#FFF3E6] text-[#382B25]'
                    : 'border-[#DDD2C6] bg-[#FFFFFF] text-[#6E5D55] hover:bg-[#FFF8EF]'
                }`}
              >
                <ShoppingBag
                  className={`w-5 h-5 shrink-0 ${
                    modality === 'retirada' ? 'text-[#D94B3D]' : 'text-[#8E7D74]'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-sm font-bold">Retirada</span>
                  <span className="block text-xs">Grátis no balcão</span>
                </div>
              </button>
            </div>

            {modality === 'entrega' ? (
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3.5 pt-2">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="checkout-street"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
                  >
                    Rua / Avenida *
                  </label>
                  <input
                    id="checkout-street"
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
                    htmlFor="checkout-number"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
                  >
                    Número *
                  </label>
                  <input
                    id="checkout-number"
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="123"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="checkout-neighborhood"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
                  >
                    Bairro *
                  </label>
                  <input
                    id="checkout-neighborhood"
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Vila Nova"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="checkout-complement"
                    className="block text-xs font-semibold text-[#382B25] mb-1.5"
                  >
                    Complemento / Referência
                  </label>
                  <input
                    id="checkout-complement"
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto 12, portão azul"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFF8EF] border border-[#EAE0D5] text-sm text-[#57473F]">
                <MapPin className="w-4 h-4 text-[#F47B35] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong className="text-[#382B25]">Endereço para retirada:</strong>{' '}
                  {store.address}
                </span>
              </div>
            )}
          </section>

          {/* Pagamento */}
          <section className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 space-y-4">
            <h2 className="font-display font-bold text-lg text-[#382B25]">
              3. Forma de pagamento
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['Pix', 'Dinheiro', 'Cartão'] as PaymentMethod[]).map((method) => {
                const selected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      selected
                        ? 'border-[#F47B35] bg-[#FFF3E6] text-[#382B25]'
                        : 'border-[#DDD2C6] bg-[#FFFFFF] text-[#6E5D55] hover:bg-[#FFF8EF]'
                    }`}
                  >
                    <CreditCard
                      className={`w-4 h-4 shrink-0 ${
                        selected ? 'text-[#D94B3D]' : 'text-[#8E7D74]'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{method}</span>
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
                  Troco para quanto? (opcional)
                </label>
                <input
                  id="checkout-change"
                  type="text"
                  inputMode="decimal"
                  value={changeForText}
                  onChange={(e) => setChangeForText(e.target.value)}
                  placeholder="Ex.: 50,00 (deixe vazio se não precisar de troco)"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="checkout-obs"
                className="block text-xs font-semibold text-[#382B25] mb-1.5"
              >
                Observações adicionais do pedido (opcional)
              </label>
              <textarea
                id="checkout-obs"
                rows={2}
                value={generalObservation}
                onChange={(e) => setGeneralObservation(e.target.value)}
                placeholder="Ex.: Enviar talheres descartáveis, tocar interfone 102..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
              />
            </div>
          </section>
        </div>

        {/* Coluna Direita: Resumo da Sacola */}
        <aside className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 space-y-4 lg:sticky lg:top-24">
          <h2 className="font-display font-bold text-lg text-[#382B25]">
            Resumo do pedido
          </h2>

          {enrichedCart.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-semibold text-[#382B25]">
                Sua sacola está vazia.
              </p>
              <button
                type="button"
                onClick={onBackToMenu}
                className="text-sm font-semibold text-[#D94B3D] hover:underline"
              >
                Voltar e escolher pratos
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#F2EAE0]">
              {enrichedCart.map((item, idx) => (
                <li key={`${item.product.id}-${idx}`} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#382B25]">
                      {item.quantity}x {item.product.name}
                    </p>
                    {item.observation && (
                      <p className="text-xs text-[#6E5D55]">Obs: {item.observation}</p>
                    )}
                    {item.unavailable && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#B42318]">
                          Indisponível no momento
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(idx)}
                          className="text-xs font-semibold text-[#B42318] underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-bold text-[#382B25] tabular-nums shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}

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
            <div className="flex justify-between font-display font-extrabold text-xl text-[#382B25] pt-2 border-t border-[#F2EAE0]">
              <span>Total</span>
              <span className="tabular-nums text-[#D94B3D]">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!store.isOpen || enrichedCart.length === 0 || hasUnavailableItems}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] disabled:bg-[#DDD2C6] disabled:text-[#6E5D55] text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>Confirmar Pedido</span>
          </button>
        </aside>
      </form>
    </div>
  );
};
