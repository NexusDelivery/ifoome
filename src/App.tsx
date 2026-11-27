/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  AdminTab,
  AppArea,
  CartItem,
  DeliveryModality,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  StoreSettings,
} from './types';
import { INITIAL_STORE_SETTINGS } from './data/mockData';
import { canTransitionOrderStatus } from './utils/format';
import {
  playNewOrderNotificationSound,
  showNewOrderBrowserNotification,
  unlockNotificationAudio,
} from './utils/notifications';
import { authService } from './services/authService';
import { dataStore } from './services/dataStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublicMenuPage } from './components/public/PublicMenuPage';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders, OrderFilter } from './components/admin/AdminOrders';
import { AdminMenu } from './components/admin/AdminMenu';
import { AdminSettings } from './components/admin/AdminSettings';
import { WhatsAppStatusModal } from './components/admin/WhatsAppStatusModal';

function AppContent() {
  const [area, setArea] = useState<AppArea>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [ordersFilter, setOrdersFilter] = useState<OrderFilter>('Ativos');

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const authInFlightRef = useRef(false);

  const [store, setStore] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const storeRef = useRef<StoreSettings>(store);
  storeRef.current = store;

  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [focusedOrderId, setFocusedOrderId] = useState<string | null>(null);
  const [whatsappPrompt, setWhatsappPrompt] = useState<{
    order: Order;
    nextStatus: OrderStatus;
  } | null>(null);
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const ordersHydratedRef = useRef(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  if (syncError) {
    throw syncError;
  }

  // Assinaturas públicas em tempo real (somente leitura pública permitida nas regras)
  useEffect(() => {
    const unsubStore = dataStore.subscribeStore(
      (nextStore) => setStore(nextStore),
      (err) => setSyncError(err)
    );
    const unsubPublicProducts = dataStore.subscribePublicProducts(
      (list) => setPublicProducts(list),
      (err) => setSyncError(err)
    );
    return () => {
      unsubStore();
      unsubPublicProducts();
    };
  }, []);

  // Observa sessão do Firebase Authentication
  useEffect(() => {
    let active = true;
    const unsubAuth = authService.subscribeAuth((user) => {
      if (!active) return;
      setAuthUser(user);
      if (!user) {
        setAdminUnlocked(false);
        setNeedsPasscode(false);
        setAuthReady(true);
        return;
      }

      if (authInFlightRef.current) {
        setAuthReady(true);
        return;
      }

      void authService
        .checkCurrentAdminAccess(user)
        .then((status) => {
          if (!active || authInFlightRef.current) return;
          setAdminUnlocked(status.unlocked);
          setNeedsPasscode(Boolean(status.needsPasscode));
          setAuthReady(true);
        })
        .catch(() => {
          if (!active || authInFlightRef.current) return;
          setAdminUnlocked(false);
          setNeedsPasscode(true);
          setAuthReady(true);
        });
    });

    return () => {
      active = false;
      unsubAuth();
    };
  }, []);

  // Assinaturas administrativas em tempo real (somente após autenticação admin confirmada)
  useEffect(() => {
    if (!authReady || !adminUnlocked || !authUser) {
      ordersHydratedRef.current = false;
      knownOrderIdsRef.current.clear();
      setAdminProducts([]);
      setOrders([]);
      return;
    }

    let cancelled = false;
    ordersHydratedRef.current = false;
    knownOrderIdsRef.current.clear();

    const initAdminWorkspace = async () => {
      try {
        await dataStore.seedInitialDataIfEmpty();
        await dataStore.syncCatalogCategoriesAndCoverage();
      } catch (err) {
        if (!cancelled) {
          setSyncError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    void initAdminWorkspace();

    const handleUserGesture = () => {
      unlockNotificationAudio();
    };
    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    const unsubAdminProducts = dataStore.subscribeAdminProducts(
      (list) => setAdminProducts(list),
      (err) => setSyncError(err)
    );
    const unsubOrders = dataStore.subscribeAdminOrders(
      (list) => {
        if (!ordersHydratedRef.current) {
          knownOrderIdsRef.current = new Set(list.map((o) => o.id));
          ordersHydratedRef.current = true;
        } else {
          let playedSoundForBatch = false;
          for (const order of list) {
            if (!knownOrderIdsRef.current.has(order.id)) {
              knownOrderIdsRef.current.add(order.id);
              if (order.status === 'Recebido' && !order.isDemo) {
                if (!playedSoundForBatch) {
                  playedSoundForBatch = true;
                  void playNewOrderNotificationSound();
                }
                showNewOrderBrowserNotification(
                  order,
                  storeRef.current.name,
                  storeRef.current.logoUrl,
                  (clickedOrderId) => {
                    setArea('admin');
                    setOrdersFilter('Ativos');
                    setAdminTab('orders');
                    setFocusedOrderId(clickedOrderId);
                  }
                );
              }
            }
          }
        }
        setOrders(list);
      },
      (err) => setSyncError(err)
    );

    return () => {
      cancelled = true;
      ordersHydratedRef.current = false;
      knownOrderIdsRef.current.clear();
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      unsubAdminProducts();
      unsubOrders();
    };
  }, [authReady, adminUnlocked, authUser]);

  const activeOrdersCount = orders.filter(
    (o) =>
      o.status === 'Recebido' ||
      o.status === 'Em preparo' ||
      o.status === 'Saiu para entrega'
  ).length;

  const availableProductsCount = adminProducts.filter((p) => p.available).length;

  const handleToggleStoreOpen = async () => {
    setAdminActionError(null);
    try {
      await dataStore.saveStore({ ...store, isOpen: !store.isOpen });
    } catch {
      setAdminActionError(
        'Não foi possível atualizar o status de abertura da loja no Firebase.'
      );
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || !canTransitionOrderStatus(target.status, nextStatus)) {
      return;
    }
    setAdminActionError(null);
    try {
      await dataStore.updateOrderStatus(orderId, nextStatus);
      setWhatsappPrompt({ order: target, nextStatus });
    } catch {
      setAdminActionError(
        'Não foi possível atualizar o status do pedido. Verifique sua conexão e permissões.'
      );
    }
  };

  const handleSaveProduct = async (
    savedProduct: Product,
    isNew: boolean,
    previousStoragePath?: string
  ) => {
    await dataStore.saveProduct(savedProduct, isNew, previousStoragePath);
  };

  const handleToggleProductAvailability = async (
    productId: string,
    nextAvailable: boolean
  ) => {
    setAdminActionError(null);
    try {
      await dataStore.toggleProductAvailability(productId, nextAvailable);
    } catch {
      setAdminActionError(
        'Não foi possível alterar a disponibilidade do prato no Firebase.'
      );
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    setAdminActionError(null);
    try {
      await dataStore.deleteProduct(product);
    } catch {
      setAdminActionError(
        'Não foi possível excluir o prato. Verifique sua conexão e permissões.'
      );
    }
  };

  const handleSaveStoreSettings = async (
    updated: StoreSettings,
    previousLogoStoragePath?: string
  ) => {
    await dataStore.saveStore(updated, previousLogoStoragePath);
  };

  const handleResetDemoData = async () => {
    await dataStore.resetDemoMenuAndStore(adminProducts);
  };

  const handleOpenOrdersWithFilter = (filter: OrderFilter) => {
    setOrdersFilter(filter);
    setAdminTab('orders');
  };

  const handlePlaceOrder = async (orderInput: {
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
  }): Promise<{ ok: boolean; error?: string; order?: Order }> => {
    return dataStore.createOrder(orderInput, publicProducts, store);
  };

  const handleGoogleSignIn = async () => {
    authInFlightRef.current = true;
    try {
      const result = await authService.signInWithGoogle();
      if (result.ok) {
        setAdminUnlocked(true);
        setNeedsPasscode(false);
      } else if (result.needsPasscode) {
        setAdminUnlocked(false);
        setNeedsPasscode(true);
      }
      return result;
    } finally {
      authInFlightRef.current = false;
    }
  };

  const handleEmailPasswordSignIn = async (email: string, password: string) => {
    authInFlightRef.current = true;
    try {
      const result = await authService.signInWithEmailAndPasswordAdmin(
        email,
        password
      );
      if (result.ok) {
        setAdminUnlocked(true);
        setNeedsPasscode(false);
      } else if (result.needsPasscode) {
        setAdminUnlocked(false);
        setNeedsPasscode(true);
      }
      return result;
    } finally {
      authInFlightRef.current = false;
    }
  };

  const handleVerifyPasscode = async (password: string) => {
    authInFlightRef.current = true;
    try {
      const result = await authService.unlockSignedInUserWithPasscode(password);
      if (result.ok) {
        setAdminUnlocked(true);
        setNeedsPasscode(false);
      }
      return result;
    } finally {
      authInFlightRef.current = false;
    }
  };

  const handleSignOut = async () => {
    await authService.signOutAdmin();
    setAdminUnlocked(false);
    setNeedsPasscode(false);
    setArea('public');
  };

  if (area === 'public') {
    return (
      <PublicMenuPage
        products={publicProducts}
        store={store}
        onSwitchToAdmin={() => setArea('admin')}
        onPlaceOrder={handlePlaceOrder}
      />
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Verificando sessão administrativa...</p>
        </div>
      </div>
    );
  }

  if (!adminUnlocked || !authUser) {
    return (
      <AdminLoginView
        storeName={store.name}
        logoUrl={store.logoUrl}
        signedInEmail={authUser?.email ?? null}
        needsPasscode={needsPasscode && Boolean(authUser)}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailPasswordSignIn={handleEmailPasswordSignIn}
        onVerifyPasscode={handleVerifyPasscode}
        onSwitchAccount={() => void authService.signOutAdmin()}
        onBackToMenu={() => setArea('public')}
      />
    );
  }

  return (
    <AdminLayout
      activeTab={adminTab}
      onSelectTab={setAdminTab}
      store={store}
      onToggleStoreOpen={() => void handleToggleStoreOpen()}
      activeOrdersCount={activeOrdersCount}
      onSwitchToPublic={() => setArea('public')}
      onLockAdmin={handleSignOut}
    >
      {adminActionError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-sm text-red-200"
        >
          <span>{adminActionError}</span>
          <button
            type="button"
            onClick={() => setAdminActionError(null)}
            className="text-xs font-semibold text-red-300 hover:text-white underline shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {adminTab === 'dashboard' && (
        <AdminDashboard
          orders={orders}
          productsCount={adminProducts.length}
          availableProductsCount={availableProductsCount}
          store={store}
          onNavigateTab={setAdminTab}
          onSelectOrdersFilter={handleOpenOrdersWithFilter}
          onUpdateOrderStatus={(id, status) =>
            void handleUpdateOrderStatus(id, status)
          }
        />
      )}

      {adminTab === 'orders' && (
        <AdminOrders
          orders={orders}
          filter={ordersFilter}
          onChangeFilter={setOrdersFilter}
          onUpdateOrderStatus={(id, status) =>
            void handleUpdateOrderStatus(id, status)
          }
          focusedOrderId={focusedOrderId}
          onClearFocusedOrder={() => setFocusedOrderId(null)}
        />
      )}

      {adminTab === 'menu' && (
        <AdminMenu
          products={adminProducts}
          onSaveProduct={handleSaveProduct}
          onToggleAvailability={handleToggleProductAvailability}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {adminTab === 'settings' && (
        <AdminSettings
          settings={store}
          currentUserEmail={authUser.email ?? undefined}
          onSaveSettings={handleSaveStoreSettings}
          onResetDemoData={handleResetDemoData}
        />
      )}

      <WhatsAppStatusModal
        order={whatsappPrompt?.order ?? null}
        nextStatus={whatsappPrompt?.nextStatus ?? null}
        storeName={store.name}
        onClose={() => setWhatsappPrompt(null)}
      />
    </AdminLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
