import React, { useState } from 'react';
import {
  Clock,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import {
  CATEGORIES,
  CartItem,
  Category,
  DeliveryModality,
  Order,
  PaymentMethod,
  Product,
  StoreSettings,
} from '../../types';
import { HERO_BANNER_IMAGE } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';
import { BrandMark } from '../BrandMark';
import { DishImage } from '../DishImage';
import { CheckoutView } from './CheckoutView';
import { OrderConfirmationView } from './OrderConfirmationView';

interface PublicMenuPageProps {
  products: Product[];
  store: StoreSettings;
  onSwitchToAdmin: () => void;
  onPlaceOrder: (orderData: {
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
    items: CartItem[];
  }) => { ok: boolean; error?: string; order?: Order };
}

type PublicView = 'menu' | 'checkout' | 'confirmation';

export const PublicMenuPage: React.FC<PublicMenuPageProps> = ({
  products,
  store,
  onSwitchToAdmin,
  onPlaceOrder,
}) => {
  const [view, setView] = useState<PublicView>('menu');
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | Category>('Todas');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Product | null>(null);
  const [dishQty, setDishQty] = useState(1);
  const [dishObs, setDishObs] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sincroniza itens da sacola com o catálogo vigente (preço e disponibilidade reais)
  const syncedCart = cart.map((item) => {
    const liveProduct = products.find((p) => p.id === item.product.id);
    return {
      ...item,
      product: liveProduct ?? item.product,
      isUnavailable: !liveProduct || !liveProduct.available,
    };
  });

  // RF-A07: O cardápio público exibe somente produtos disponíveis
  const availableProducts = products.filter((p) => p.available);

  const visibleProducts = availableProducts.filter((p) => {
    const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.ingredients.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const totalCartItems = syncedCart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = syncedCart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const hasUnavailableInCart = syncedCart.some((item) => item.isUnavailable);

  const openDishModal = (product: Product) => {
    setSelectedDish(product);
    setDishQty(1);
    setDishObs('');
  };

  const addToCart = (product: Product, quantity: number, observation?: string) => {
    if (!store.isOpen || !product.available) return;
    const cleanObs = observation?.trim() || undefined;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (item.observation ?? '') === (cleanObs ?? '')
      );
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, product, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, observation: cleanObs }];
    });
  };

  const updateCartItemQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCheckoutSubmit = (orderData: {
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
  }) => {
    const result = onPlaceOrder({
      ...orderData,
      items: syncedCart.map(({ product, quantity, observation }) => ({
        product,
        quantity,
        observation,
      })),
    });
    if (result.ok && result.order) {
      setConfirmedOrder(result.order);
      setCart([]);
      setView('confirmation');
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF] text-[#382B25] flex flex-col">
      {/* Top Bar Contract (3 zonas limpas) */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EAE0D5]">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setView('menu')}
            className="text-left focus-visible:outline-2 focus-visible:outline-[#F47B35] rounded-lg"
          >
            <BrandMark />
          </button>

          <nav
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#6E5D55]"
            aria-label="Navegação do cardápio"
          >
            <a
              href="#cardapio"
              onClick={() => setView('menu')}
              className="hover:text-[#382B25] transition-colors whitespace-nowrap shrink-0"
            >
              Cardápio
            </a>
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="hover:text-[#D94B3D] transition-colors whitespace-nowrap shrink-0"
            >
              Painel do Restaurante
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="md:hidden min-h-[40px] px-3 py-1.5 rounded-xl border border-[#DDD2C6] text-xs font-semibold text-[#382B25] hover:bg-[#FFF8EF] whitespace-nowrap shrink-0"
            >
              Painel
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir sacola com ${totalCartItems} itens`}
              className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Sacola</span>
              <span className="tabular-nums bg-[#FFF8EF] text-[#D94B3D] font-bold text-xs px-1.5 py-0.5 rounded-md">
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Roteamento Interno Público */}
      {view === 'checkout' && (
        <main className="flex-1">
          <CheckoutView
            cart={syncedCart}
            catalogProducts={products}
            store={store}
            onBackToMenu={() => setView('menu')}
            onRemoveCartItem={removeCartItem}
            onSubmitOrder={handleCheckoutSubmit}
          />
        </main>
      )}

      {view === 'confirmation' && confirmedOrder && (
        <main className="flex-1">
          <OrderConfirmationView
            order={confirmedOrder}
            store={store}
            onBackToMenu={() => {
              setConfirmedOrder(null);
              setView('menu');
            }}
          />
        </main>
      )}

      {view === 'menu' && (
        <main className="flex-1 pb-24 md:pb-12">
          {/* Hero do Estabelecimento */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
            <div className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#EAE0D5] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                        store.isOpen
                          ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]'
                          : 'bg-[#FDECE9] text-[#B42318] border-[#FECDCA]'
                      }`}
                    >
                      {store.isOpen ? (
                        <Store className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {store.isOpen ? 'Aberto para pedidos' : 'Fechado no momento'}
                      </span>
                    </span>
                    <span className="text-[#6E5D55]">Cardápio digital · Sem cadastro</span>
                  </div>

                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#382B25] tracking-tight text-balance">
                    {store.name}
                  </h1>

                  <p className="text-sm sm:text-base text-[#6E5D55] max-w-xl leading-relaxed">
                    {store.subtitle}
                  </p>
                </div>

                <div
                  id="info-restaurante"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#F2EAE0] text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 text-[#57473F]">
                    <Clock className="w-4 h-4 text-[#F47B35] shrink-0" aria-hidden="true" />
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#57473F]">
                    <MapPin className="w-4 h-4 text-[#F47B35] shrink-0" aria-hidden="true" />
                    <span className="truncate">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#57473F] tabular-nums">
                    <Phone className="w-4 h-4 text-[#F47B35] shrink-0" aria-hidden="true" />
                    <span>
                      Entrega {store.deliveryEstimate} ·{' '}
                      {store.deliveryFee === 0
                        ? 'Grátis'
                        : formatCurrency(store.deliveryFee)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative min-h-[200px] sm:min-h-[240px]">
                <img
                  src={HERO_BANNER_IMAGE}
                  alt={`Pratos caseiros preparados na ${store.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#382B25]/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#FFFFFF]/15 lg:to-transparent"
                  aria-hidden="true"
                />
              </div>
            </div>
          </section>

          {/* Aviso de Loja Fechada (RN-02) */}
          {!store.isOpen && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
              <div
                role="status"
                className="flex items-start sm:items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#FDECE9] border border-[#FECDCA] text-sm text-[#B42318]"
              >
                <Lock className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
                <div>
                  <strong>Estamos fechados no momento.</strong> Você pode consultar os pratos e preços abaixo, mas novos pedidos estão pausados até o próximo horário de atendimento ({store.openingHours}).
                </div>
              </div>
            </section>
          )}

          {/* Barra de Categorias e Busca */}
          <section id="cardapio" className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Categorias do cardápio"
              >
                {(['Todas', ...CATEGORIES] as const).map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedCategory(cat)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#382B25] text-[#FFF8EF]'
                          : 'bg-[#FFFFFF] border border-[#EAE0D5] text-[#6E5D55] hover:text-[#382B25]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full md:w-72 shrink-0">
                <Search
                  className="w-4 h-4 text-[#6E5D55] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar marmita, bebida..."
                  aria-label="Buscar prato no cardápio"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#DDD2C6] text-sm text-[#382B25] placeholder:text-[#8E7D74] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
              </div>
            </div>

            {/* Grade de Produtos Disponíveis */}
            {visibleProducts.length === 0 ? (
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-8 text-center">
                <p className="font-display font-bold text-base text-[#382B25]">
                  Nenhum prato disponível nessa busca
                </p>
                <p className="text-sm text-[#6E5D55] mt-1">
                  Veja outras categorias acima para conferir os pratos do dia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleProducts.map((product) => {
                  const qtyInCart = syncedCart
                    .filter((c) => c.product.id === product.id)
                    .reduce((acc, c) => acc + c.quantity, 0);

                  return (
                    <article
                      key={product.id}
                      className="group bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => openDishModal(product)}
                        className="text-left focus-visible:outline-2 focus-visible:outline-[#F47B35]"
                      >
                        <DishImage src={product.imageUrl} alt={product.name} />
                        <div className="p-4 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-[#6E5D55]">
                            <span>{product.category}</span>
                            {qtyInCart > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-[#D94B3D] tabular-nums">
                                  {qtyInCart} na sacola
                                </span>
                              </>
                            )}
                          </div>
                          <h2 className="font-display font-bold text-lg text-[#382B25] leading-snug">
                            {product.name}
                          </h2>
                          <p className="text-xs sm:text-sm text-[#6E5D55] line-clamp-2 leading-relaxed">
                            {product.description || product.ingredients}
                          </p>
                        </div>
                      </button>

                      <div className="px-4 pb-4 pt-3 border-t border-[#F2EAE0] flex items-center justify-between gap-3">
                        <span className="font-display font-extrabold text-lg text-[#382B25] tabular-nums">
                          {formatCurrency(product.price)}
                        </span>

                        <button
                          type="button"
                          disabled={!store.isOpen}
                          onClick={() => addToCart(product, 1)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F47B35] hover:bg-[#E06822] disabled:bg-[#EAE0D5] disabled:text-[#8E7D74] text-white text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Rodapé discreto */}
      <footer className="border-t border-[#EAE0D5] bg-[#FFFFFF] py-5 px-4 sm:px-6 text-xs text-[#6E5D55]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {store.name} · Atendimento {store.openingHours}
          </span>
          <span>iFoome Delivery · Cardápio digital para pequenos empreendedores</span>
        </div>
      </footer>

      {/* Barra inferior rápida do carrinho no celular (respeitando limite de 15%) */}
      {view === 'menu' && totalCartItems > 0 && !cartOpen && !selectedDish && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-[#FFF8EF]/95 backdrop-blur-md border-t border-[#EAE0D5]">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#D94B3D] text-white font-semibold text-sm flex items-center justify-between shadow-md"
          >
            <span className="inline-flex items-center gap-2 tabular-nums">
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>
                Ver Sacola ({totalCartItems}{' '}
                {totalCartItems === 1 ? 'item' : 'itens'})
              </span>
            </span>
            <span className="font-display font-bold text-base tabular-nums">
              {formatCurrency(cartSubtotal)}
            </span>
          </button>
        </div>
      )}

      {/* Modal de Detalhes do Prato + Observação */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#382B25]/50 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-modal-title"
        >
          <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl border border-[#EAE0D5] overflow-hidden shadow-xl">
            <div className="relative">
              <DishImage src={selectedDish.imageUrl} alt={selectedDish.name} />
              <button
                type="button"
                onClick={() => setSelectedDish(null)}
                aria-label="Fechar detalhes do prato"
                className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-[#FFFFFF]/95 text-[#382B25] shadow-md flex items-center justify-center hover:bg-[#FFFFFF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-[#6E5D55]">
                  {selectedDish.category}
                </p>
                <h3
                  id="dish-modal-title"
                  className="font-display font-bold text-xl text-[#382B25] mt-0.5"
                >
                  {selectedDish.name}
                </h3>
                <p className="font-display font-extrabold text-xl text-[#D94B3D] tabular-nums mt-1">
                  {formatCurrency(selectedDish.price)}
                </p>
              </div>

              {selectedDish.description && (
                <p className="text-sm text-[#57473F] leading-relaxed">
                  {selectedDish.description}
                </p>
              )}

              {selectedDish.ingredients && (
                <div className="px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EAE0D5] text-xs text-[#57473F]">
                  <strong className="text-[#382B25]">Ingredientes: </strong>
                  {selectedDish.ingredients}
                </div>
              )}

              <div>
                <label
                  htmlFor="dish-obs-input"
                  className="block text-xs font-semibold text-[#382B25] mb-1.5"
                >
                  Alguma observação? (opcional)
                </label>
                <input
                  id="dish-obs-input"
                  type="text"
                  value={dishObs}
                  onChange={(e) => setDishObs(e.target.value)}
                  placeholder="Ex.: Sem cebola, pouco arroz, feijão separado..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <div className="flex items-center border border-[#DDD2C6] rounded-xl bg-[#FFF8EF]">
                  <button
                    type="button"
                    onClick={() => setDishQty((q) => Math.max(1, q - 1))}
                    aria-label="Diminuir quantidade"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#382B25]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm tabular-nums">
                    {dishQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDishQty((q) => q + 1)}
                    aria-label="Aumentar quantidade"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#382B25]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!store.isOpen}
                  onClick={() => {
                    addToCart(selectedDish, dishQty, dishObs);
                    setSelectedDish(null);
                  }}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] disabled:bg-[#DDD2C6] disabled:text-[#6E5D55] text-white text-sm font-semibold flex items-center justify-between gap-2 transition-colors"
                >
                  <span>{store.isOpen ? 'Adicionar à Sacola' : 'Loja Fechada'}</span>
                  <span className="tabular-nums">
                    {formatCurrency(selectedDish.price * dishQty)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Sheet da Sacola */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#382B25]/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <div className="w-full sm:max-w-md h-full bg-[#FFFFFF] flex flex-col justify-between shadow-2xl border-l border-[#EAE0D5]">
            <div className="px-5 py-4 border-b border-[#EAE0D5] flex items-center justify-between gap-3">
              <div>
                <h2
                  id="cart-drawer-title"
                  className="font-display font-bold text-xl text-[#382B25]"
                >
                  Sua Sacola
                </h2>
                <p className="text-xs text-[#6E5D55] tabular-nums">
                  {totalCartItems} {totalCartItems === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Fechar sacola"
                className="min-w-[44px] min-h-[44px] -mr-2 rounded-xl flex items-center justify-center text-[#6E5D55] hover:bg-[#F7EFE5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {syncedCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF3E6] text-[#F47B35] flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <p className="font-display font-bold text-base text-[#382B25]">
                    Sua sacola está vazia
                  </p>
                  <p className="text-sm text-[#6E5D55] max-w-xs">
                    Escolha suas marmitas, bebidas ou sobremesas no cardápio para montar seu pedido.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F2EAE0]">
                  {syncedCart.map((item, idx) => (
                    <li key={`${item.product.id}-${idx}`} className="py-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#382B25]">
                            {item.product.name}
                          </p>
                          {item.isUnavailable && (
                            <p className="text-xs font-semibold text-[#B42318] mt-0.5">
                              Item indisponível no momento — remova para finalizar.
                            </p>
                          )}
                          {item.observation && (
                            <p className="text-xs text-[#6E5D55] mt-0.5">
                              Obs: {item.observation}
                            </p>
                          )}
                          <p className="text-xs text-[#6E5D55] tabular-nums mt-0.5">
                            {formatCurrency(item.product.price)} cada
                          </p>
                        </div>
                        <span className="font-display font-bold text-sm text-[#382B25] tabular-nums shrink-0">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#DDD2C6] rounded-xl bg-[#FFF8EF]">
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(idx, -1)}
                            aria-label={`Diminuir ${item.product.name}`}
                            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#382B25]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(idx, 1)}
                            aria-label={`Aumentar ${item.product.name}`}
                            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#382B25]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCartItem(idx)}
                          aria-label={`Remover ${item.product.name}`}
                          className="min-h-[40px] px-2.5 rounded-xl text-xs font-semibold text-[#B42318] hover:bg-[#FDECE9] flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {syncedCart.length > 0 && (
              <div className="p-5 border-t border-[#EAE0D5] bg-[#FFF8EF] space-y-3">
                <div className="flex justify-between items-center text-sm text-[#6E5D55]">
                  <span>Subtotal dos itens</span>
                  <span className="font-display font-bold text-lg text-[#382B25] tabular-nums">
                    {formatCurrency(cartSubtotal)}
                  </span>
                </div>
                <p className="text-xs text-[#6E5D55]">
                  Entrega ({store.deliveryFee === 0 ? 'Grátis' : formatCurrency(store.deliveryFee)}) ou retirada gratuita serão escolhidas no próximo passo.
                </p>
                <button
                  type="button"
                  disabled={!store.isOpen || hasUnavailableInCart}
                  onClick={() => {
                    setCartOpen(false);
                    setView('checkout');
                  }}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] disabled:bg-[#DDD2C6] disabled:text-[#6E5D55] text-white font-semibold text-base transition-colors"
                >
                  {!store.isOpen
                    ? 'Restaurante Fechado'
                    : hasUnavailableInCart
                      ? 'Remova itens indisponíveis'
                      : 'Ir para Finalização'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
