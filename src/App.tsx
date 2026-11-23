/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
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

  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const [store, setStore] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [syncError, setSyncError] = useState<Error | null>(null);

  if (syncError) {
    throw syncError;
  }

  // Assinaturas públicas em tempo real (não requerem login)
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

  // Assinaturas administrativas em tempo real (somente após validar a senha)
  useEffect(() => {
    if (!adminUnlocked) {
      setAdminProducts([]);
      setOrders([]);
      return;
    }

    void dataStore.seedInitialDataIfEmpty().catch((err) => {
      setSyncError(err instanceof Error ? err : new Error(String(err)));
    });

    const unsubAdminProducts = dataStore.subscribeAdminProducts(
      (list) => setAdminProducts(list),
      (err) => setSyncError(err)
    );
    const unsubOrders = dataStore.subscribeAdminOrders(
      (list) => setOrders(list),
      (err) => setSyncError(err)
    );

    return () => {
      unsubAdminProducts();
      unsubOrders();
    };
  }, [adminUnlocked]);

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

  const handleVerifyAdminPassword = async (password: string) => {
    const result = await authService.unlockAdminPanel(password);
    if (result.ok) {
      setAdminUnlocked(true);
    }
    return result;
  };

  const handleLockAdmin = () => {
    setAdminUnlocked(false);
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

  if (!adminUnlocked) {
    return (
      <AdminLoginView
        storeName={store.name}
        logoUrl={store.logoUrl}
        onVerifyPassword={handleVerifyAdminPassword}
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
      onLockAdmin={handleLockAdmin}
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
