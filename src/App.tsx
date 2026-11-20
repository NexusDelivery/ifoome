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
import { canTransitionOrderStatus } from './utils/format';
import { dataStore } from './services/dataStore';
import { PublicMenuPage } from './components/public/PublicMenuPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders, OrderFilter } from './components/admin/AdminOrders';
import { AdminMenu } from './components/admin/AdminMenu';
import { AdminSettings } from './components/admin/AdminSettings';

export default function App() {
  const [area, setArea] = useState<AppArea>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [ordersFilter, setOrdersFilter] = useState<OrderFilter>('Ativos');

  const [products, setProducts] = useState<Product[]>(
    () => dataStore.loadInitialData().products
  );
  const [orders, setOrders] = useState<Order[]>(
    () => dataStore.loadInitialData().orders
  );
  const [store, setStore] = useState<StoreSettings>(
    () => dataStore.loadInitialData().store
  );

  useEffect(() => {
    dataStore.saveProducts(products);
  }, [products]);

  useEffect(() => {
    dataStore.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    dataStore.saveStore(store);
  }, [store]);

  const activeOrdersCount = orders.filter(
    (o) =>
      o.status === 'Recebido' ||
      o.status === 'Em preparo' ||
      o.status === 'Saiu para entrega'
  ).length;

  const availableProductsCount = products.filter((p) => p.available).length;

  const handleToggleStoreOpen = () => {
    setStore((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (!canTransitionOrderStatus(order.status, nextStatus)) {
          return order;
        }
        return { ...order, status: nextStatus };
      })
    );
  };

  const handleSaveProduct = (savedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      }
      return [savedProduct, ...prev];
    });
  };

  const handleToggleProductAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, available: !p.available } : p
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleResetDemoData = () => {
    const reset = dataStore.resetToDemo();
    setProducts(reset.products);
    setOrders(reset.orders);
    setStore(reset.store);
  };

  const handleOpenOrdersWithFilter = (filter: OrderFilter) => {
    setOrdersFilter(filter);
    setAdminTab('orders');
  };

  const handlePlaceOrder = (orderInput: {
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
  }): { ok: boolean; error?: string; order?: Order } => {
    if (!store.isOpen) {
      return { ok: false, error: 'O restaurante está fechado no momento.' };
    }
    if (orderInput.items.length === 0) {
      return { ok: false, error: 'A sacola está vazia.' };
    }

    // Recalcula preços e valida disponibilidade usando os dados oficiais do cardápio (RN-01 / RN-04)
    const snapshotItems = [];
    for (const cartItem of orderInput.items) {
      const catalogItem = products.find((p) => p.id === cartItem.product.id);
      if (!catalogItem || !catalogItem.available) {
        return {
          ok: false,
          error: `O prato "${cartItem.product.name}" não está mais disponível.`,
        };
      }
      snapshotItems.push({
        productId: catalogItem.id,
        name: catalogItem.name,
        unitPrice: catalogItem.price,
        quantity: cartItem.quantity,
        observation: cartItem.observation,
      });
    }

    const subtotal = snapshotItems.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );
    const deliveryFee = orderInput.modality === 'entrega' ? store.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    const maxNumericCode = orders.reduce((max, o) => {
      const parsed = Number.parseInt(o.code.replace(/\D/g, ''), 10);
      return Number.isNaN(parsed) ? max : Math.max(max, parsed);
    }, 1045);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: `#${maxNumericCode + 1}`,
      createdAt: new Date().toISOString(),
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
      modality: orderInput.modality,
      address: orderInput.address,
      paymentMethod: orderInput.paymentMethod,
      changeFor: orderInput.changeFor,
      generalObservation: orderInput.generalObservation,
      items: snapshotItems,
      subtotal,
      deliveryFee,
      total,
      status: 'Recebido',
      isDemo: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return { ok: true, order: newOrder };
  };

  if (area === 'public') {
    return (
      <PublicMenuPage
        products={products}
        store={store}
        onSwitchToAdmin={() => setArea('admin')}
        onPlaceOrder={handlePlaceOrder}
      />
    );
  }

  return (
    <AdminLayout
      activeTab={adminTab}
      onSelectTab={setAdminTab}
      store={store}
      onToggleStoreOpen={handleToggleStoreOpen}
      activeOrdersCount={activeOrdersCount}
      onSwitchToPublic={() => setArea('public')}
    >
      {adminTab === 'dashboard' && (
        <AdminDashboard
          orders={orders}
          productsCount={products.length}
          availableProductsCount={availableProductsCount}
          store={store}
          onNavigateTab={setAdminTab}
          onSelectOrdersFilter={handleOpenOrdersWithFilter}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {adminTab === 'orders' && (
        <AdminOrders
          orders={orders}
          filter={ordersFilter}
          onChangeFilter={setOrdersFilter}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {adminTab === 'menu' && (
        <AdminMenu
          products={products}
          onSaveProduct={handleSaveProduct}
          onToggleAvailability={handleToggleProductAvailability}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {adminTab === 'settings' && (
        <AdminSettings
          settings={store}
          onSaveSettings={setStore}
          onResetDemoData={handleResetDemoData}
        />
      )}
    </AdminLayout>
  );
}
