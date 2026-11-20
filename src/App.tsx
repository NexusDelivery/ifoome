import React, { useMemo, useState } from 'react';
import { Check, ChefHat } from 'lucide-react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminMenu } from './components/admin/AdminMenu';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminSettings } from './components/admin/AdminSettings';
import { BrandLogo } from './components/BrandLogo';
import {
  CheckoutView,
  OrderConfirmationView,
  OrderTrackingView,
} from './components/public/CheckoutView';
import { PublicStorefront } from './components/public/PublicStorefront';
import {
  INITIAL_DEMO_DISHES,
  INITIAL_DEMO_ORDERS,
  INITIAL_STORE_CONFIG,
} from './data/demoData';
import {
  AdminSection,
  AppArea,
  CartItem,
  DeliveryMode,
  Dish,
  Order,
  OrderStatus,
  PaymentMethod,
  PublicView,
  StoreConfig,
} from './types/ifoome';
import { calculateDailySummary } from './utils/formatters';

export default function App() {
  const [area, setArea] = useState<AppArea>('public');
  const [publicView, setPublicView] = useState<PublicView>('cardapio');
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DEMO_DISHES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const summary = useMemo(() => calculateDailySummary(orders), [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  // Ações do Carrinho
  const handleAddToCart = (dish: Dish, quantity: number, observation: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.dishId === dish.id &&
          item.observation.trim().toLowerCase() === observation.trim().toLowerCase()
      );
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity,
          observation,
          imageUrl: dish.imageUrl,
        },
      ];
    });
    showToast(`${quantity}x ${dish.name} adicionado ao carrinho`);
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Finalização de pedido (com regras de validação da RN-04)
  const handleSubmitOrder = (payload: {
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
  }): { ok: boolean; error?: string; order?: Order } => {
    if (!storeConfig.isOpen) {
      return {
        ok: false,
        error: 'O restaurante fechou no momento. Não é possível finalizar novos pedidos.',
      };
    }

    if (cart.length === 0) {
      return {
        ok: false,
        error: 'Seu carrinho está vazio. Adicione pelo menos um prato.',
      };
    }

    for (const cartItem of cart) {
      const currentDish = dishes.find((d) => d.id === cartItem.dishId);
      if (!currentDish || !currentDish.available) {
        return {
          ok: false,
          error: `O prato "${cartItem.name}" ficou indisponível. Remova-o para continuar.`,
        };
      }
    }

    if (!payload.customerName.trim()) {
      return { ok: false, error: 'Informe seu nome para identificação do pedido.' };
    }

    const phoneDigits = payload.customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return {
        ok: false,
        error: 'Informe um telefone ou WhatsApp válido com DDD (mínimo 10 dígitos).',
      };
    }

    if (payload.deliveryMode === 'entrega') {
      if (
        !payload.street.trim() ||
        !payload.number.trim() ||
        !payload.neighborhood.trim()
      ) {
        return {
          ok: false,
          error: 'Para entrega, preencha Rua/Avenida, Número e Bairro.',
        };
      }
    }

    // Recalcula snapshot oficial pelos preços vigentes
    const itemsSnapshot = cart.map((cartItem) => {
      const official = dishes.find((d) => d.id === cartItem.dishId)!;
      return {
        dishId: official.id,
        name: official.name,
        unitPrice: official.price,
        quantity: cartItem.quantity,
        observation: cartItem.observation || undefined,
      };
    });

    const subtotal = itemsSnapshot.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const deliveryFee =
      payload.deliveryMode === 'entrega' ? storeConfig.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    const nextNumber = 1045 + orders.length;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: `#${nextNumber}`,
      createdAt: new Date().toISOString(),
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      deliveryMode: payload.deliveryMode,
      address:
        payload.deliveryMode === 'entrega'
          ? {
              street: payload.street.trim(),
              number: payload.number.trim(),
              neighborhood: payload.neighborhood.trim(),
              complement: payload.complement.trim() || undefined,
            }
          : undefined,
      paymentMethod: payload.paymentMethod,
      changeFor: payload.changeFor,
      generalObservation: payload.generalObservation.trim() || undefined,
      items: itemsSnapshot,
      subtotal,
      deliveryFee,
      total,
      status: 'Recebido',
      isDemo: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setLastCreatedOrder(newOrder);
    setPublicView('confirmacao');
    return { ok: true, order: newOrder };
  };

  // Ações administrativas
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    showToast(`Status atualizado para "${nextStatus}"`);
  };

  const handleToggleDishAvailability = (dishId: string) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, available: !d.available } : d))
    );
  };

  const handleAddDish = (dishPayload: Omit<Dish, 'id'>) => {
    const newDish: Dish = {
      ...dishPayload,
      id: `dish-${Date.now()}`,
    };
    setDishes((prev) => [newDish, ...prev]);
    showToast(`"${newDish.name}" adicionado ao cardápio`);
  };

  const handleUpdateDish = (updated: Dish) => {
    setDishes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`"${updated.name}" atualizado`);
  };

  const handleDeleteDish = (dishId: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== dishId));
    showToast('Prato removido do cardápio');
  };

  const handleToggleStoreOpen = () => {
    setStoreConfig((prev) => {
      const nextOpen = !prev.isOpen;
      showToast(nextOpen ? 'Loja aberta para pedidos' : 'Loja fechada para novos pedidos');
      return { ...prev, isOpen: nextOpen };
    });
  };

  const handleOpenOrderDetailsFromDashboard = (order: Order) => {
    setSelectedAdminOrder(order);
    setAdminSection('pedidos');
  };

  return (
    <div className="min-h-screen bg-[#F6F9F7] text-[#263238]">
      {area === 'public' ? (
        <>
          {/* Top Bar Pública (Contrato de 3 zonas) */}
          <header className="sticky top-0 z-40 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-[#DCE6E0]">
            <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
              <button
                type="button"
                onClick={() => setPublicView('cardapio')}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#287A55] rounded-lg"
              >
                <BrandLogo variant="compact" />
              </button>

              <nav
                aria-label="Navegação do cliente"
                className="flex items-center gap-4 sm:gap-6 text-sm font-semibold"
              >
                <button
                  type="button"
                  onClick={() => setPublicView('cardapio')}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    publicView === 'cardapio'
                      ? 'border-[#287A55] text-[#287A55]'
                      : 'border-transparent text-[#263238]/75 hover:text-[#263238]'
                  }`}
                >
                  Cardápio
                </button>
                <button
                  type="button"
                  onClick={() => setPublicView('acompanhar')}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    publicView === 'acompanhar'
                      ? 'border-[#287A55] text-[#287A55]'
                      : 'border-transparent text-[#263238]/75 hover:text-[#263238]'
                  }`}
                >
                  Pedidos
                </button>
              </nav>

              <button
                type="button"
                onClick={() => setArea('admin')}
                className="min-h-[38px] px-3 sm:px-4 py-1.5 rounded-xl bg-[#263238] text-white text-xs font-semibold hover:bg-[#1C262B] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <ChefHat className="w-3.5 h-3.5 text-[#F4C95D]" aria-hidden="true" />
                <span>Painel do Lojista</span>
              </button>
            </div>
          </header>

          {/* Conteúdo da Área Pública */}
          {publicView === 'cardapio' && (
            <PublicStorefront
              dishes={dishes}
              storeConfig={storeConfig}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onRemoveCartItem={handleRemoveCartItem}
              onProceedToCheckout={() => setPublicView('checkout')}
            />
          )}

          {publicView === 'checkout' && (
            <CheckoutView
              cart={cart}
              dishes={dishes}
              storeConfig={storeConfig}
              onBackToMenu={() => setPublicView('cardapio')}
              onSubmitOrder={handleSubmitOrder}
            />
          )}

          {publicView === 'confirmacao' && lastCreatedOrder && (
            <OrderConfirmationView
              order={lastCreatedOrder}
              storeConfig={storeConfig}
              onTrackOrders={() => setPublicView('acompanhar')}
              onBackToMenu={() => setPublicView('cardapio')}
            />
          )}

          {publicView === 'acompanhar' && (
            <OrderTrackingView
              orders={orders}
              onBackToMenu={() => setPublicView('cardapio')}
            />
          )}
        </>
      ) : (
        <AdminLayout
          activeSection={adminSection}
          onSelectSection={setAdminSection}
          activeOrdersCount={summary.activeOrdersCount}
          storeConfig={storeConfig}
          onToggleStoreOpen={handleToggleStoreOpen}
          onSwitchToPublic={() => {
            setArea('public');
            setPublicView('cardapio');
          }}
        >
          {adminSection === 'dashboard' && (
            <AdminDashboard
              orders={orders}
              dishesCount={dishes.length}
              availableDishesCount={dishes.filter((d) => d.available).length}
              onNavigate={setAdminSection}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenOrderDetails={handleOpenOrderDetailsFromDashboard}
            />
          )}

          {adminSection === 'pedidos' && (
            <AdminOrders
              orders={orders}
              selectedOrder={selectedAdminOrder}
              onSelectOrder={setSelectedAdminOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {adminSection === 'cardapio' && (
            <AdminMenu
              dishes={dishes}
              onAddDish={handleAddDish}
              onUpdateDish={handleUpdateDish}
              onDeleteDish={handleDeleteDish}
              onToggleAvailability={handleToggleDishAvailability}
            />
          )}

          {adminSection === 'configuracoes' && (
            <AdminSettings
              storeConfig={storeConfig}
              onSaveConfig={(next) => {
                setStoreConfig(next);
                showToast('Configurações atualizadas');
              }}
            />
          )}
        </AdminLayout>
      )}

      {/* Feedback Toast Discreto */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#263238] text-white text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 whitespace-nowrap"
        >
          <Check className="w-4 h-4 text-[#F4C95D] shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
