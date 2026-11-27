import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CakeSlice,
  CheckCircle2,
  ChefHat,
  Clock,
  CupSoda,
  Flame,
  Lock,
  MapPin,
  Minus,
  Plus,
  Search,
  Shapes,
  ShieldCheck,
  ShoppingBag,
  Soup,
  Star,
  Store,
  Trash2,
  Utensils,
  UtensilsCrossed,
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
  }) => Promise<{ ok: boolean; error?: string; order?: Order }>;
}

type PublicView = 'menu' | 'checkout' | 'confirmation';

const CATEGORY_ICONS: Record<'Todas' | Category, React.FC<{ className?: string }>> = {
  Todas: Utensils,
  Marmitas: Soup,
  'Pratos Executivos': ChefHat,
  Porções: Flame,
  Bebidas: CupSoda,
  Sobremesas: CakeSlice,
};

// Nota visual decorativa determinística (apenas estética, sem persistência no banco)
function getVisualStarRating(productId: string): string {
  let hash = 0;
  for (let i = 0; i < productId.length; i += 1) {
    hash = (hash * 31 + productId.charCodeAt(i)) % 5;
  }
  const ratings = ['4.8', '4.9', '5.0', '4.7', '4.9'];
  return ratings[hash] ?? '4.9';
}

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
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!cartOpen && !selectedDish) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        setSelectedDish(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cartOpen, selectedDish]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2400);
  };

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

  const visibleProducts = availableProducts
    .filter((p) => {
      const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.ingredients.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const idxA = CATEGORIES.indexOf(a.category);
      const idxB = CATEGORIES.indexOf(b.category);
      if (idxA !== idxB) return idxA - idxB;
      return a.name.localeCompare(b.name, 'pt-BR');
    });

  const totalCartItems = syncedCart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = syncedCart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const hasUnavailableInCart = syncedCart.some((item) => item.isUnavailable);
  const estimatedTotalWithDelivery = cartSubtotal + store.deliveryFee;

  const openDishModal = (product: Product) => {
    setSelectedDish(product);
    setDishQty(1);
    setDishObs('');
  };

  const addToCart = (product: Product, quantity: number, observation?: string) => {
    if (!store.isOpen || !product.available) return;
    const safeQty = Math.max(1, Math.min(99, quantity));
    const cleanObs = observation?.trim().slice(0, 300) || undefined;
    let limitReached = false;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (item.observation ?? '') === (cleanObs ?? '')
      );
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, product, quantity: Math.min(99, item.quantity + safeQty) }
            : item
        );
      }
      if (prev.length >= 50) {
        limitReached = true;
        return prev;
      }
      return [...prev, { product, quantity: safeQty, observation: cleanObs }];
    });
    if (limitReached) {
      showToast('Limite de 50 itens diferentes no carrinho atingido.');
      return;
    }
    showToast(`+${safeQty} ${product.name} adicionado!`);
  };

  const updateCartItemQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, idx) =>
          idx === index
            ? { ...item, quantity: Math.min(99, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetFilters = () => {
    setSelectedCategory('Todas');
    setSearch('');
  };

  const handleCheckoutSubmit = async (orderData: {
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
    const result = await onPlaceOrder({
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header / Barra de Navegação Nexus */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setView('menu')}
            className="text-left focus-visible:outline-2 focus-visible:outline-orange-500 rounded-xl min-w-0 shrink"
          >
            <BrandMark logoUrl={store.logoUrl} alt={store.name} />
          </button>

          {/* Barra de Busca Centralizada (Desktop) */}
          {view === 'menu' && (
            <div className="flex-1 max-w-lg hidden md:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquise por marmitas, pratos, bebidas..."
                  aria-label="Buscar prato no cardápio"
                  className="w-full bg-slate-800/80 text-sm text-slate-100 rounded-full pl-11 pr-10 py-3 border border-slate-700/80 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Limpar busca"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ações do Topo: Localização & Carrinho */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/50 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[170px]">{store.address}</span>
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrinho com ${totalCartItems} itens`}
              className="relative min-h-[40px] sm:min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 sm:gap-2.5 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline text-sm">Carrinho</span>
              <span className="bg-slate-950 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-500/30 tabular-nums">
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>

        {/* Barra de busca para mobile */}
        {view === 'menu' && (
          <div className="p-3 border-t border-slate-800 md:hidden bg-slate-900/60">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" aria-hidden="true" />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="O que deseja pedir hoje?"
                aria-label="Buscar prato no cardápio"
                className="w-full bg-slate-800 text-xs text-slate-100 rounded-xl pl-9 pr-9 py-2.5 border border-slate-700 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
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
        <div className="flex-1 pb-24 md:pb-8 flex flex-col">
          {/* Banner Hero Promocional */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/80 via-slate-900 to-orange-950/80 border border-slate-800 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="z-10 max-w-xl text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      store.isOpen
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}
                  >
                    {store.isOpen ? (
                      <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {store.isOpen
                        ? `Aberto agora · ${store.openingHours}`
                        : `Fechado no momento · ${store.openingHours}`}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/70 text-slate-300 border border-slate-700/70">
                    <Store className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                    <span>{store.name}</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-[1.111] lg:leading-none text-white mb-2">
                  Comida rápida, fresca e{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    surpreendente
                  </span>
                  .
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {store.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-4 z-10 shrink-0">
                <div className="text-center p-3 sm:p-4 rounded-2xl bg-slate-800/60 backdrop-blur border border-slate-700/60">
                  <div className="text-orange-400 font-bold text-lg sm:text-xl">~25 min</div>
                  <div className="text-slate-400 text-xs">Tempo médio</div>
                </div>
                <div
                  className="text-center p-3.5 sm:p-4 rounded-2xl bg-slate-800/60 backdrop-blur border border-slate-700/60 min-w-[116px]"
                  aria-label="Avaliação ilustrativa 4.9 estrelas"
                >
                  <div className="text-amber-400 font-bold text-lg sm:text-xl tabular-nums flex items-center justify-center gap-1">
                    <span>4.9</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  </div>
                  <div className="text-slate-400 text-xs">Qualidade Nexus</div>
                </div>
              </div>

              {/* Background Ambient Glow */}
              <div
                className="absolute -right-16 -top-16 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </section>

          {/* Aviso de Loja Fechada (RN-02) */}
          {!store.isOpen && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
              <div
                role="status"
                className="flex items-start sm:items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-sm text-red-200"
              >
                <Lock className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-red-400" aria-hidden="true" />
                <div>
                  <strong className="text-white">Estamos fechados no momento.</strong> Você pode consultar os pratos e preços abaixo, mas novos pedidos estão pausados até o próximo horário de atendimento ({store.openingHours}).
                </div>
              </div>
            </section>
          )}

          {/* Filtros por Categoria */}
          <section id="cardapio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-200 tracking-wide uppercase text-xs flex items-center gap-2">
                <Shapes className="w-4 h-4 text-orange-500" aria-hidden="true" />
                <span>Categorias</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium tabular-nums">
                {visibleProducts.length} {visibleProducts.length === 1 ? 'prato encontrado' : 'pratos encontrados'}
              </span>
            </div>

            <div
              className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none"
              role="tablist"
              aria-label="Categorias do cardápio"
            >
              {(['Todas', ...CATEGORIES] as const).map((cat) => {
                const isActive = selectedCategory === cat;
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 border transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 font-bold border-transparent'
                        : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/60 font-medium'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Grade de Cardápio / Pratos */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full flex-1">
            {visibleProducts.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                  <UtensilsCrossed className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-1">
                  {availableProducts.length === 0
                    ? 'Cardápio em atualização no momento'
                    : 'Nenhum prato encontrado'}
                </h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-4">
                  {availableProducts.length === 0
                    ? 'Ainda não há pratos publicados como disponíveis. Volte em instantes ou acesse a área do estabelecimento para cadastrar o cardápio.'
                    : 'Não encontramos opções correspondentes à sua pesquisa. Tente usar outros termos ou categorias.'}
                </p>
                {availableProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-all"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleProducts.map((product) => {
                  const qtyInCart = syncedCart
                    .filter((c) => c.product.id === product.id)
                    .reduce((acc, c) => acc + c.quantity, 0);
                  const visualStars = getVisualStarRating(product.id);

                  return (
                    <article
                      key={product.id}
                      className="group bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => openDishModal(product)}
                          className="w-full text-left focus-visible:outline-2 focus-visible:outline-orange-500 block"
                        >
                          {/* Imagem do Prato com Badges */}
                          <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                            <DishImage
                              src={product.imageUrl}
                              alt={product.name}
                              className="!aspect-auto h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div
                              className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"
                              aria-hidden="true"
                            />

                            {/* Avaliação Visual Decorativa */}
                            <div
                              className="absolute top-3 right-3 badge-blur bg-slate-900/80 border border-slate-700/60 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-amber-300 font-bold shadow-md tabular-nums"
                              aria-hidden="true"
                            >
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{visualStars}</span>
                            </div>

                            {/* Tempo de Entrega */}
                            <div className="absolute bottom-3 left-3 badge-blur bg-slate-950/80 border border-slate-700/60 text-slate-200 text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium tabular-nums">
                              <Clock className="w-3 h-3 text-orange-400" aria-hidden="true" />
                              <span>{store.deliveryEstimate}</span>
                            </div>

                            {qtyInCart > 0 && (
                              <div className="absolute bottom-3 right-3 badge-blur bg-orange-500/90 text-white text-[11px] px-2 py-0.5 rounded-md font-bold tabular-nums shadow">
                                {qtyInCart} no carrinho
                              </div>
                            )}
                          </div>

                          {/* Detalhes do Prato */}
                          <div className="p-4">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400/90 block mb-1">
                              {product.category}
                            </span>
                            <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors line-clamp-1 mb-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {product.description || product.ingredients}
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Preço e Botão Adicionar */}
                      <div className="p-4 pt-3 flex items-center justify-between border-t border-slate-800/60 mt-auto">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                            A partir de
                          </span>
                          <span className="text-lg font-black text-white tracking-tight tabular-nums">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={!store.isOpen}
                          onClick={() => addToCart(product, 1)}
                          className="min-h-[40px] bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-500 active:scale-95 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Rodapé Nexus com acesso discreto ao painel administrativo */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
              N
            </div>
            <span>
              <strong className="font-semibold text-slate-200">Nexus Delivery</strong> ·{' '}
              {store.name} · {store.openingHours}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
            <a
              href={`${import.meta.env.BASE_URL}Privacidade.html`}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Política de Privacidade</span>
            </a>
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors py-1"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Área do estabelecimento</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Barra inferior rápida do carrinho no celular */}
      {view === 'menu' && totalCartItems > 0 && !cartOpen && !selectedDish && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-950/95 backdrop-blur-md border-t border-slate-800">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-full min-h-[48px] px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm flex items-center justify-between gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-transform"
          >
            <span className="inline-flex items-center gap-2 tabular-nums min-w-0">
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                Ver Carrinho ({totalCartItems}{' '}
                {totalCartItems === 1 ? 'item' : 'itens'})
              </span>
            </span>
            <span className="font-display font-bold text-sm sm:text-base tabular-nums shrink-0">
              {formatCurrency(cartSubtotal)}
            </span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modal de Detalhes do Prato + Observação */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-modal-title"
        >
          <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="relative">
              <DishImage
                src={selectedDish.imageUrl}
                alt={selectedDish.name}
                className="h-56 w-full !aspect-auto"
              />
              <button
                type="button"
                onClick={() => setSelectedDish(null)}
                aria-label="Fechar detalhes do prato"
                className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-800 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div
                className="absolute bottom-3 right-3 badge-blur bg-slate-900/85 border border-slate-700/70 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-amber-300 font-bold tabular-nums"
                aria-hidden="true"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{getVisualStarRating(selectedDish.id)}</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  {selectedDish.category}
                </p>
                <h3
                  id="dish-modal-title"
                  className="font-display font-bold text-xl text-white mt-0.5"
                >
                  {selectedDish.name}
                </h3>
                <p className="font-display font-extrabold text-xl text-orange-400 tabular-nums mt-1">
                  {formatCurrency(selectedDish.price)}
                </p>
              </div>

              {selectedDish.description && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedDish.description}
                </p>
              )}

              {selectedDish.ingredients && (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70 text-xs text-slate-300">
                  <strong className="text-white">Ingredientes: </strong>
                  {selectedDish.ingredients}
                </div>
              )}

              <div>
                <label
                  htmlFor="dish-obs-input"
                  className="block text-xs font-semibold text-slate-200 mb-1.5"
                >
                  Alguma observação? (opcional)
                </label>
                <input
                  id="dish-obs-input"
                  type="text"
                  maxLength={300}
                  value={dishObs}
                  onChange={(e) => setDishObs(e.target.value)}
                  placeholder="Ex.: Sem cebola, pouco arroz, feijão separado..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <div className="flex items-center border border-slate-700 rounded-xl bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setDishQty((q) => Math.max(1, q - 1))}
                    aria-label="Diminuir quantidade"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-200 hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white tabular-nums">
                    {dishQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDishQty((q) => Math.min(99, q + 1))}
                    aria-label="Aumentar quantidade"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-200 hover:text-white"
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
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-sm font-bold flex items-center justify-between gap-2 transition-all shadow-lg shadow-orange-500/20"
                >
                  <span>{store.isOpen ? 'Adicionar ao Carrinho' : 'Loja Fechada'}</span>
                  <span className="tabular-nums">
                    {formatCurrency(selectedDish.price * dishQty)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Lateral do Carrinho */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setCartOpen(false)}
          />

          <div className="relative w-full sm:max-w-md h-[100dvh] max-h-[100dvh] bg-slate-900 sm:border-l border-slate-800 shadow-2xl flex flex-col">
            {/* Cabeçalho do Carrinho */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="cart-drawer-title"
                    className="font-bold text-white text-base truncate"
                  >
                    Seu Pedido
                  </h2>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {totalCartItems} {totalCartItems === 1 ? 'item selecionado' : 'itens selecionados'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Fechar carrinho"
                className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Itens do Carrinho */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3 sm:space-y-4">
              {syncedCart.length === 0 ? (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 mb-3">
                    <ShoppingBag className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-slate-300 text-sm">
                    Seu carrinho está vazio
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                    Adicione pratos deliciosos ao seu pedido para começar.
                  </p>
                </div>
              ) : (
                syncedCart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl border border-slate-700/50 space-y-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <DishImage
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 !aspect-square rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                            {item.product.name}
                          </h4>
                          <span className="text-xs sm:text-sm text-orange-400 font-bold tabular-nums shrink-0">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                        {item.observation && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 break-words">
                            Obs: {item.observation}
                          </p>
                        )}
                        {item.isUnavailable && (
                          <p className="text-[11px] font-semibold text-red-400 mt-1">
                            Item indisponível — remova para finalizar.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/40">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="tabular-nums">
                          {formatCurrency(item.product.price)} cada
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCartItem(idx)}
                          aria-label={`Remover ${item.product.name}`}
                          className="min-h-[32px] px-1.5 text-red-400 hover:text-red-300 font-semibold inline-flex items-center gap-1 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Remover</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded-xl shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartItemQty(idx, -1)}
                          aria-label={`Diminuir ${item.product.name}`}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[24px] text-center text-xs font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQty(idx, 1)}
                          aria-label={`Aumentar ${item.product.name}`}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé / Resumo financeiro do Carrinho */}
            <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-800 bg-slate-900/95 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between gap-2">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    {formatCurrency(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Taxa de Entrega (estimada)</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">
                    {store.deliveryFee === 0
                      ? 'Grátis'
                      : formatCurrency(store.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 pt-2 border-t border-slate-800 text-sm font-bold text-white">
                  <span>Total (com entrega)</span>
                  <span className="text-orange-400 text-base tabular-nums">
                    {syncedCart.length === 0
                      ? formatCurrency(0)
                      : formatCurrency(estimatedTotalWithDelivery)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  syncedCart.length === 0 || !store.isOpen || hasUnavailableInCart
                }
                onClick={() => {
                  setCartOpen(false);
                  setView('checkout');
                }}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>
                  {!store.isOpen
                    ? 'Restaurante Fechado'
                    : hasUnavailableInCart
                      ? 'Remova itens indisponíveis'
                      : 'Confirmar e Pedir'}
                </span>
                {store.isOpen && !hasUnavailableInCart && (
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span>Escolha entrega ou retirada gratuita na próxima etapa</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
