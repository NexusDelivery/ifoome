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
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [syncError, setSyncError] = useState<Error | null>(null);

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
      setAdminProducts([]);
      setOrders([]);
      return;
    }

    let cancelled = false;

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

    const unsubAdminProducts = dataStore.subscribeAdminProducts(
      (list) => setAdminProducts(list),
      (err) => setSyncError(err)
    );
    const unsubOrders = dataStore.subscribeAdminOrders(
      (list) => setOrders(list),
      (err) => setSyncError(err)
    );

    return () => {
      cancelled = true;
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
    await dataStore.saveStore({ ...store, isOpen: !store.isOpen });
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || !canTransitionOrderStatus(target.status, nextStatus)) {
      return;
    }
    await dataStore.updateOrderStatus(orderId, nextStatus);
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
    await dataStore.toggleProductAvailability(productId, nextAvailable);
  };

  const handleDeleteProduct = async (product: Product) => {
    await dataStore.deleteProduct(product);
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
