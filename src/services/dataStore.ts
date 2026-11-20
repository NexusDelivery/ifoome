import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS,
} from '../data/mockData';
import type { Order, Product, StoreSettings } from '../types';

const STORAGE_KEYS = {
  products: 'ifoome:v1:products',
  orders: 'ifoome:v1:orders',
  store: 'ifoome:v1:store',
} as const;

export interface AppDataSnapshot {
  products: Product[];
  orders: Order[];
  store: StoreSettings;
}

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignora falha de quota/privacidade mantendo estado em memória
  }
}

/**
 * Camada centralizada de persistência temporária (localStorage).
 * Na etapa de arquitetura/banco de dados, estes métodos poderão ser
 * substituídos por chamadas à API/Firebase sem reescrever as telas.
 */
export const dataStore = {
  loadInitialData(): AppDataSnapshot {
    const products = safeReadJson<Product[]>(STORAGE_KEYS.products, INITIAL_PRODUCTS);
    const orders = safeReadJson<Order[]>(STORAGE_KEYS.orders, INITIAL_ORDERS);
    const store = safeReadJson<StoreSettings>(STORAGE_KEYS.store, INITIAL_STORE_SETTINGS);

    return {
      products: Array.isArray(products) ? products : INITIAL_PRODUCTS,
      orders: Array.isArray(orders) ? orders : INITIAL_ORDERS,
      store: store && typeof store.name === 'string' ? store : INITIAL_STORE_SETTINGS,
    };
  },

  saveProducts(products: Product[]): void {
    safeWriteJson(STORAGE_KEYS.products, products);
  },

  saveOrders(orders: Order[]): void {
    safeWriteJson(STORAGE_KEYS.orders, orders);
  },

  saveStore(store: StoreSettings): void {
    safeWriteJson(STORAGE_KEYS.store, store);
  },

  resetToDemo(): AppDataSnapshot {
    safeWriteJson(STORAGE_KEYS.products, INITIAL_PRODUCTS);
    safeWriteJson(STORAGE_KEYS.orders, INITIAL_ORDERS);
    safeWriteJson(STORAGE_KEYS.store, INITIAL_STORE_SETTINGS);
    return {
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      store: INITIAL_STORE_SETTINGS,
    };
  },
};
