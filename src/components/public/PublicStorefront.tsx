import React, { useMemo, useState } from 'react';
import {
  Clock,
  Info,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { DISH_CATEGORIES, HERO_BANNER_IMAGE } from '../../data/demoData';
import { CartItem, Dish, DishCategory, StoreConfig } from '../../types/ifoome';
import { formatCurrency } from '../../utils/formatters';
import { DishImage } from '../DishImage';

interface PublicStorefrontProps {
  dishes: Dish[];
  storeConfig: StoreConfig;
  cart: CartItem[];
  onAddToCart: (dish: Dish, quantity: number, observation: string) => void;
  onUpdateCartQuantity: (index: number, delta: number) => void;
  onRemoveCartItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({
  dishes,
  storeConfig,
  cart,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onProceedToCheckout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | DishCategory>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDish, setActiveDish] = useState<Dish | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalObs, setModalObs] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Regra RF-A07 / RN-01: área pública exibe somente itens disponíveis
  const availableDishes = useMemo(
    () => dishes.filter((dish) => dish.available),
    [dishes]
  );

  const visibleCategories = useMemo(() => {
    return DISH_CATEGORIES.filter((cat) =>
      availableDishes.some((dish) => dish.category === cat)
    );
  }, [availableDishes]);

  const filteredDishes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return availableDishes.filter((dish) => {
      const matchesCat =
        selectedCategory === 'Todas' || dish.category === selectedCategory;
      if (!matchesCat) return false;
      if (!query) return true;
      return (
        dish.name.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query) ||
        dish.ingredients.toLowerCase().includes(query)
      );
    });
  }, [availableDishes, selectedCategory, searchQuery]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const openDishModal = (dish: Dish) => {
    setActiveDish(dish);
    setModalQty(1);
    setModalObs('');
  };

  const handleConfirmModalAdd = () => {
    if (!activeDish || !storeConfig.isOpen) return;
    onAddToCart(activeDish, modalQty, modalObs.trim());
    setActiveDish(null);
  };

  return (
    <div className="pb-24 md:pb-12">
      {/* Aviso claro de dados demonstrativos */}
      <div className="bg-[#DDEFE3]/65 border-b border-[#287A55]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 text-xs text-[#263238]/85">
          <Info className="w-4 h-4 text-[#287A55] shrink-0" aria-hidden="true" />
          <span>
            Exibição demonstrativa: pratos e pedidos abaixo são exemplos para navegação do cardápio digital.
          </span>
        </div>
      </div>

      {/* Hero Editorial do Estabelecimento */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        <div className="bg-white rounded-2xl border border-[#DCE6E0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                {storeConfig.isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DDEFE3] text-[#1E6143] border border-[#287A55]/25">
                    <Store className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Aberto agora</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4C95D]/35 text-[#263238] border border-[#F4C95D]">
                    <Store className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Fechado no momento</span>
                  </span>
                )}
                <span className="text-[#263238]/65 font-medium">
                  {storeConfig.openingHours}
                </span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-[#263238] tracking-tight text-balance">
                {storeConfig.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#263238]/75 max-w-xl leading-relaxed">
                {storeConfig.subtitle}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E6EFEA] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#263238]/80">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#287A55]" aria-hidden="true" />
                <span>Preparo em {storeConfig.estimatedTime}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#287A55]" aria-hidden="true" />
                <span>{storeConfig.pickupAddress}</span>
              </span>
              <span className="font-semibold text-[#287A55] tabular-nums">
                Entrega:{' '}
                {storeConfig.deliveryFee > 0
                  ? formatCurrency(storeConfig.deliveryFee)
                  : 'Grátis'}{' '}
                · Retirada grátis
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[190px] sm:min-h-[240px] lg:min-h-full bg-[#DDEFE3]">
            <img
              src={HERO_BANNER_IMAGE}
              alt={`Pratos caseiros do ${storeConfig.name}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
          </div>
        </div>

        {/* Alerta quando loja estiver fechada (RN-02) */}
        {!storeConfig.isOpen && (
          <div
            role="status"
            className="mt-4 rounded-xl bg-[#F4C95D]/25 border border-[#F4C95D] px-4 py-3.5 flex items-start gap-3 text-sm text-[#263238]"
          >
            <Clock className="w-5 h-5 text-[#9A6E04] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold">Estamos fechados no momento.</p>
              <p className="text-[#263238]/80">
                Você pode consultar os pratos e valores normalmente, mas novos pedidos estão pausados até a reabertura ({storeConfig.openingHours}).
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Barra de Busca e Categorias */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filtro interativo por categorias */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
            role="tablist"
            aria-label="Categorias do cardápio"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'Todas'}
              onClick={() => setSelectedCategory('Todas')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'Todas'
                  ? 'bg-[#287A55] text-white'
                  : 'bg-white text-[#263238]/80 border border-[#DCE6E0] hover:bg-[#DDEFE3]/50'
              }`}
            >
              Todas
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#287A55] text-white'
                    : 'bg-white text-[#263238]/80 border border-[#DCE6E0] hover:bg-[#DDEFE3]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Campo de busca + Botão do carrinho desktop */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex-1 md:w-64">
              <Search
                className="w-4 h-4 text-[#263238]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prato ou ingrediente..."
                aria-label="Buscar prato no cardápio"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white border border-[#DCE6E0] text-sm text-[#263238] placeholder:text-[#263238]/45 focus:outline-none focus:ring-2 focus:ring-[#287A55] focus:border-[#287A55]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hidden md:inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#263238] text-white text-sm font-semibold hover:bg-[#1C262B] transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-[#F4C95D]" aria-hidden="true" />
              <span>Carrinho</span>
              <span className="font-mono tabular-nums text-xs bg-white/15 px-2 py-0.5 rounded-md">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Grade de Pratos Disponíveis */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {filteredDishes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE6E0] p-10 text-center">
            <p className="text-base font-semibold text-[#263238]">
              Nenhum prato disponível encontrado.
            </p>
            <p className="mt-1 text-sm text-[#263238]/70">
              Tente limpar a busca ou escolher outra categoria do cardápio.
            </p>
            {(searchQuery || selectedCategory !== 'Todas') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todas');
                }}
                className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-[#DDEFE3] text-[#1E6143] text-sm font-semibold hover:bg-[#CCE6D5] transition-colors"
              >
                Ver todo o cardápio
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredDishes.map((dish) => {
              const inCartQty = cart
                .filter((item) => item.dishId === dish.id)
                .reduce((sum, item) => sum + item.quantity, 0);

              return (
                <article
                  key={dish.id}
                  className="bg-white rounded-2xl border border-[#DCE6E0] overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => openDishModal(dish)}
                      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#287A55]"
                    >
                      <div className="aspect-[4/3] w-full bg-[#F6F9F7] overflow-hidden">
                        <DishImage
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-full"
                        />
                      </div>
                    </button>

                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#263238]/60 font-medium">
                        <span>{dish.category}</span>
                        {inCartQty > 0 && (
                          <span className="text-[#287A55] font-semibold tabular-nums">
                            {inCartQty} no carrinho
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openDishModal(dish)}
                        className="mt-1.5 text-left block w-full focus:outline-none"
                      >
                        <h2 className="text-lg font-bold text-[#263238] leading-snug hover:text-[#287A55] transition-colors">
                          {dish.name}
                        </h2>
                      </button>

                      <p className="mt-1.5 text-sm text-[#263238]/75 line-clamp-2 leading-relaxed">
                        {dish.description || dish.ingredients}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 flex items-center justify-between gap-3">
                    <span className="text-lg font-bold text-[#263238] tabular-nums">
                      {formatCurrency(dish.price)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDishModal(dish)}
                        disabled={!storeConfig.isOpen}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] disabled:bg-[#DCE6E0] disabled:text-[#263238]/45 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>{storeConfig.isOpen ? 'Adicionar' : 'Indisponível'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Barra Fixa do Carrinho no Mobile (<= 15% da altura da tela) */}
      {cartCount > 0 && (
        <div className="fixed bottom-3 left-4 right-4 z-30 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full h-[52px] px-4 rounded-xl bg-[#287A55] text-white shadow-lg flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
          >
            <span className="inline-flex items-center gap-2.5 text-sm font-semibold">
              <ShoppingBag className="w-5 h-5 text-[#F4C95D]" aria-hidden="true" />
              <span>Ver carrinho ({cartCount})</span>
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatCurrency(cartSubtotal)}
            </span>
          </button>
        </div>
      )}

      {/* Modal de Detalhes do Prato + Observação */}
      {activeDish && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#263238]/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-modal-title"
        >
          <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-[#DCE6E0] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="relative aspect-[16/10] w-full bg-[#F6F9F7] shrink-0">
              <DishImage
                src={activeDish.imageUrl}
                alt={activeDish.name}
                className="w-full h-full"
              />
              <button
                type="button"
                onClick={() => setActiveDish(null)}
                aria-label="Fechar detalhes do prato"
                className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/95 text-[#263238] shadow-md hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <p className="text-xs font-medium text-[#263238]/60">
                  {activeDish.category}
                </p>
                <div className="mt-1 flex items-start justify-between gap-4">
                  <h3 id="dish-modal-title" className="text-xl font-bold text-[#263238]">
                    {activeDish.name}
                  </h3>
                  <span className="text-lg font-bold text-[#287A55] tabular-nums shrink-0">
                    {formatCurrency(activeDish.price)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#263238]/80 leading-relaxed">
                  {activeDish.description}
                </p>
                {activeDish.ingredients && (
                  <p className="mt-2 text-xs text-[#263238]/65">
                    <strong className="font-semibold text-[#263238]/80">Ingredientes:</strong>{' '}
                    {activeDish.ingredients}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dish-observation"
                  className="block text-sm font-semibold text-[#263238] mb-1.5"
                >
                  Alguma observação? (opcional)
                </label>
                <textarea
                  id="dish-observation"
                  rows={2}
                  value={modalObs}
                  onChange={(e) => setModalObs(e.target.value)}
                  placeholder="Ex.: sem cebola, caprichar no feijão, pouco sal..."
                  className="w-full rounded-xl border border-[#DCE6E0] px-3.5 py-2.5 text-sm text-[#263238] placeholder:text-[#263238]/45 focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-[#E6EFEA] bg-[#F6F9F7] flex items-center justify-between gap-3 shrink-0">
              <div className="inline-flex items-center rounded-xl border border-[#DCE6E0] bg-white">
                <button
                  type="button"
                  onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                  aria-label="Diminuir quantidade"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#263238] hover:bg-[#F6F9F7] rounded-l-xl"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums">
                  {modalQty}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQty((q) => q + 1)}
                  aria-label="Aumentar quantidade"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#263238] hover:bg-[#F6F9F7] rounded-r-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!storeConfig.isOpen}
                onClick={handleConfirmModalAdd}
                className="flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] disabled:bg-[#DCE6E0] disabled:text-[#263238]/45 transition-colors flex items-center justify-between gap-2"
              >
                <span>{storeConfig.isOpen ? 'Adicionar ao carrinho' : 'Loja fechada'}</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(activeDish.price * modalQty)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Sheet Lateral do Carrinho */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#263238]/55 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-[#E6EFEA] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#287A55]" aria-hidden="true" />
                <h2 id="cart-drawer-title" className="text-lg font-bold text-[#263238]">
                  Seu Carrinho
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                aria-label="Fechar carrinho"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#263238]/70 hover:bg-[#F6F9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag
                    className="w-10 h-10 text-[#287A55]/40 mx-auto mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-base font-semibold text-[#263238]">
                    Seu carrinho está vazio
                  </p>
                  <p className="mt-1 text-sm text-[#263238]/65">
                    Escolha um prato do cardápio para montar seu pedido.
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.dishId}-${idx}`}
                    className="pb-4 border-b border-[#E6EFEA] last:border-b-0 flex gap-3.5"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F6F9F7] shrink-0">
                      <DishImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#263238] leading-snug">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(idx)}
                          aria-label={`Remover ${item.name}`}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#263238]/45 hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.observation && (
                        <p className="mt-1 text-xs text-[#263238]/70 bg-[#F6F9F7] px-2.5 py-1 rounded-md">
                          Obs.: {item.observation}
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-lg border border-[#DCE6E0]">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(idx, -1)}
                            aria-label={`Diminuir quantidade de ${item.name}`}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#263238] hover:bg-[#F6F9F7]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(idx, 1)}
                            aria-label={`Aumentar quantidade de ${item.name}`}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#263238] hover:bg-[#F6F9F7]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-[#263238] tabular-nums">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-[#E6EFEA] bg-[#F6F9F7] space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#263238]/75">
                    <span>Subtotal dos itens</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#263238]/75">
                    <span>Entrega padrão (ou retirada grátis)</span>
                    <span className="font-mono tabular-nums">
                      {storeConfig.deliveryFee > 0
                        ? formatCurrency(storeConfig.deliveryFee)
                        : 'Grátis'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!storeConfig.isOpen}
                  onClick={() => {
                    setIsCartOpen(false);
                    onProceedToCheckout();
                  }}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] disabled:bg-[#DCE6E0] disabled:text-[#263238]/45 transition-colors"
                >
                  {storeConfig.isOpen ? 'Ir para finalização' : 'Loja fechada no momento'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
