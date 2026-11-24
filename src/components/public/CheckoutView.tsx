import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bike,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  ALL_PAYMENT_METHODS,
  CartItem,
  DeliveryModality,
  Order,
  PaymentMethod,
  Product,
  StoreSettings,
} from '../../types';
import {
  clearSavedCustomerData,
  loadSavedCustomerData,
  saveCustomerData,
} from '../../utils/customerStorage';
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
  }) => Promise<{ ok: boolean; error?: string; order?: Order }>;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  catalogProducts,
  store,
  onBackToMenu,
  onRemoveCartItem,
  onSubmitOrder,
}) => {
  const availablePaymentMethods =
    store.paymentMethods && store.paymentMethods.length > 0
      ? store.paymentMethods
      : ALL_PAYMENT_METHODS;

  const [initialSaved] = useState(() => loadSavedCustomerData());
  const [customerName, setCustomerName] = useState(
    () => initialSaved?.customerName ?? ''
  );
  const [customerPhone, setCustomerPhone] = useState(() =>
    initialSaved?.customerPhone ? formatPhoneMask(initialSaved.customerPhone) : ''
  );
  const [modality, setModality] = useState<DeliveryModality>(
    () => initialSaved?.modality ?? 'entrega'
  );
  const [street, setStreet] = useState(() => initialSaved?.street ?? '');
  const [number, setNumber] = useState(() => initialSaved?.number ?? '');
  const [neighborhood, setNeighborhood] = useState(
    () => initialSaved?.neighborhood ?? ''
  );
  const [complement, setComplement] = useState(() => initialSaved?.complement ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() =>
    initialSaved?.paymentMethod &&
    availablePaymentMethods.includes(initialSaved.paymentMethod)
      ? initialSaved.paymentMethod
      : availablePaymentMethods[0]
  );
  const [changeForText, setChangeForText] = useState('');
  const [generalObservation, setGeneralObservation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasAnySavedFields = Boolean(
    customerName.trim() ||
      customerPhone.trim() ||
      street.trim() ||
      number.trim() ||
      neighborhood.trim() ||
      complement.trim()
  );

  useEffect(() => {
    if (!availablePaymentMethods.includes(paymentMethod)) {
      setPaymentMethod(availablePaymentMethods[0]);
    }
  }, [availablePaymentMethods, paymentMethod]);

  useEffect(() => {
    if (!hasAnySavedFields) return;
    saveCustomerData({
      customerName,
      customerPhone,
      modality,
      street,
      number,
      neighborhood,
      complement,
      paymentMethod,
    });
  }, [
    hasAnySavedFields,
    customerName,
    customerPhone,
    modality,
    street,
    number,
    neighborhood,
    complement,
    paymentMethod,
  ]);

  const handleClearSavedProfile = () => {
    clearSavedCustomerData();
    setCustomerName('');
    setCustomerPhone('');
    setModality('entrega');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setComplement('');
    setPaymentMethod(availablePaymentMethods[0]);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      setErrorMsg(
        'Informe um telefone/WhatsApp válido com DDD (10 ou 11 dígitos).'
      );
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

    setSubmitting(true);
    try {
      const result = await onSubmitOrder({
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
    } catch {
      setErrorMsg(
        'Erro ao registrar seu pedido no sistema. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToMenu}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-200 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" aria-hidden="true" />
          <span>Voltar ao cardápio</span>
        </button>

        <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
          Finalizar Pedido
        </h1>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-sm font-medium text-red-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
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
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display font-bold text-lg text-white">
                1. Seus dados
              </h2>
              {hasAnySavedFields && (
                <button
                  type="button"
                  onClick={handleClearSavedProfile}
                  className="text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors"
                >
                  Limpar dados salvos
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 tabular-nums focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </section>

          {/* Modalidade */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">
              2. Como deseja receber?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModality('entrega')}
                className={`min-h-[56px] px-4 py-3 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                  modality === 'entrega'
                    ? 'border-orange-500 bg-orange-500/15 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Bike
                  className={`w-5 h-5 shrink-0 ${
                    modality === 'entrega' ? 'text-orange-400' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-sm font-bold">Entrega</span>
                  <span className="block text-xs tabular-nums text-slate-300">
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
                    ? 'border-orange-500 bg-orange-500/15 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ShoppingBag
                  className={`w-5 h-5 shrink-0 ${
                    modality === 'retirada' ? 'text-orange-400' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-sm font-bold">Retirada</span>
                  <span className="block text-xs text-slate-300">Grátis no balcão</span>
                </div>
              </button>
            </div>

            {modality === 'entrega' ? (
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3.5 pt-2">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="checkout-street"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-number"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="checkout-neighborhood"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="checkout-complement"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Complemento / Referência
                  </label>
                  <input
                    id="checkout-complement"
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto 12, portão azul"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong className="text-white">Endereço para retirada:</strong>{' '}
                  {store.address}
                </span>
              </div>
            )}
          </section>

          {/* Pagamento */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">
              3. Forma de pagamento
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {availablePaymentMethods.map((method) => {
                const selected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      selected
                        ? 'border-orange-500 bg-orange-500/15 text-white'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard
                      className={`w-4 h-4 shrink-0 ${
                        selected ? 'text-orange-400' : 'text-slate-400'
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
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 tabular-nums focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="checkout-obs"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Observações adicionais do pedido (opcional)
              </label>
              <textarea
                id="checkout-obs"
                rows={2}
                value={generalObservation}
                onChange={(e) => setGeneralObservation(e.target.value)}
                placeholder="Ex.: Enviar talheres descartáveis, tocar interfone 102..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </section>
        </div>

        {/* Coluna Direita: Resumo da Sacola */}
        <aside className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 lg:sticky lg:top-24">
          <h2 className="font-display font-bold text-lg text-white">
            Resumo do pedido
          </h2>

          {enrichedCart.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-300">
                Seu carrinho está vazio.
              </p>
              <button
                type="button"
                onClick={onBackToMenu}
                className="text-sm font-semibold text-orange-400 hover:underline"
              >
                Voltar e escolher pratos
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {enrichedCart.map((item, idx) => (
                <li
                  key={`${item.product.id}-${idx}`}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {item.quantity}x {item.product.name}
                    </p>
                    {item.observation && (
                      <p className="text-xs text-slate-400">
                        Obs: {item.observation}
                      </p>
                    )}
                    {item.unavailable && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-red-400">
                          Indisponível no momento
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(idx)}
                          className="text-xs font-semibold text-red-400 underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-100 tabular-nums shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="tabular-nums text-slate-200">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxa de entrega</span>
              <span className="tabular-nums text-emerald-400 font-semibold">
                {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between font-display font-extrabold text-xl text-white pt-2 border-t border-slate-800">
              <span>Total</span>
              <span className="tabular-nums text-orange-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !store.isOpen ||
              enrichedCart.length === 0 ||
              hasUnavailableItems ||
              submitting
            }
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Registrando pedido...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                <span>Confirmar Pedido</span>
              </>
            )}
          </button>
        </aside>
      </form>
    </div>
  );
};
