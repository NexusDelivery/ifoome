import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS,
} from '../data/mockData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  ALL_PAYMENT_METHODS,
  CATEGORIES,
  type CartItem,
  type Category,
  type DeliveryModality,
  type Order,
  type OrderStatus,
  type PaymentMethod,
  type Product,
  type StoreSettings,
} from '../types';
import { deleteStorageFileIfManaged } from './storageService';
import { resolveBundledAssetUrl } from '../utils/assetResolver';

const RESTAURANT_DOC_ID = 'default';

const CATEGORY_ORDER = new Map<Category, number>(
  CATEGORIES.map((cat, idx) => [cat, idx])
);

function sortProductsByCategoryOrder(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const orderA = CATEGORY_ORDER.get(a.category) ?? 99;
    const orderB = CATEGORY_ORDER.get(b.category) ?? 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

function inferExpectedCategory(name: string): Category | null {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    /(pudim|brownie|sobremesa|mousse|torta|bolo|sorvete|acai|pave|brigadeiro|doce)/.test(
      normalized
    )
  ) {
    return 'Sobremesas';
  }
  if (
    /(suco|refrigerante|guarana|coca|pepsi|agua|cerveja|bebida|milkshake|soda|refri|cha|limonada)/.test(
      normalized
    )
  ) {
    return 'Bebidas';
  }
  if (
    /(porcao|porcoes|torresmo|mandioca|batata frita|calabresa|petisco|pastel)/.test(
      normalized
    )
  ) {
    return 'Porções';
  }
  if (/(feijoada|parmegiana|executivo|picanha|contrafile|file)/.test(normalized)) {
    return 'Pratos Executivos';
  }
  if (/(marmita|marmitex|quentinha)/.test(normalized)) {
    return 'Marmitas';
  }
  return null;
}

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return new Date().toISOString();
}

function normalizeStore(raw?: Record<string, unknown>): StoreSettings {
  if (!raw) return INITIAL_STORE_SETTINGS;
  const rawMethods = Array.isArray(raw.paymentMethods)
    ? raw.paymentMethods.filter((m): m is PaymentMethod =>
        ALL_PAYMENT_METHODS.includes(m as PaymentMethod)
      )
    : [];

  return {
    id: typeof raw.id === 'string' ? raw.id : RESTAURANT_DOC_ID,
    name:
      typeof raw.name === 'string' && raw.name.trim()
        ? raw.name
        : INITIAL_STORE_SETTINGS.name,
    subtitle:
      typeof raw.subtitle === 'string'
        ? raw.subtitle
        : INITIAL_STORE_SETTINGS.subtitle,
    logoUrl: resolveBundledAssetUrl(
      typeof raw.logoUrl === 'string' ? raw.logoUrl : ''
    ),
    logoStoragePath:
      typeof raw.logoStoragePath === 'string' ? raw.logoStoragePath : undefined,
    phone:
      typeof raw.phone === 'string' ? raw.phone : INITIAL_STORE_SETTINGS.phone,
    address:
      typeof raw.address === 'string'
        ? raw.address
        : INITIAL_STORE_SETTINGS.address,
    openingHours:
      typeof raw.openingHours === 'string'
        ? raw.openingHours
        : INITIAL_STORE_SETTINGS.openingHours,
    deliveryEstimate:
      typeof raw.deliveryEstimate === 'string'
        ? raw.deliveryEstimate === '30–45 min'
          ? '20-30 min'
          : raw.deliveryEstimate
        : INITIAL_STORE_SETTINGS.deliveryEstimate,
    deliveryFee:
      typeof raw.deliveryFee === 'number'
        ? raw.deliveryFee
        : INITIAL_STORE_SETTINGS.deliveryFee,
    paymentMethods:
      rawMethods.length > 0 ? rawMethods : INITIAL_STORE_SETTINGS.paymentMethods,
    isOpen:
      typeof raw.isOpen === 'boolean'
        ? raw.isOpen
        : INITIAL_STORE_SETTINGS.isOpen,
    updatedAt: raw.updatedAt ? toIsoString(raw.updatedAt) : undefined,
  };
}

function normalizeProduct(
  id: string,
  raw: Record<string, unknown>
): Product {
  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : '',
    category: raw.category as Product['category'],
    price: typeof raw.price === 'number' ? raw.price : 0,
    ingredients: typeof raw.ingredients === 'string' ? raw.ingredients : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    imageUrl: resolveBundledAssetUrl(
      typeof raw.imageUrl === 'string' ? raw.imageUrl : ''
    ),
    imageStoragePath:
      typeof raw.imageStoragePath === 'string'
        ? raw.imageStoragePath
        : undefined,
    available: Boolean(raw.available),
    createdAt: raw.createdAt ? toIsoString(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? toIsoString(raw.updatedAt) : undefined,
  };
}

function normalizeOrder(id: string, raw: Record<string, unknown>): Order {
  return {
    id,
    code: typeof raw.code === 'string' ? raw.code : '#0000',
    createdAt: toIsoString(raw.createdAt),
    updatedAt: raw.updatedAt ? toIsoString(raw.updatedAt) : undefined,
    customerName:
      typeof raw.customerName === 'string' ? raw.customerName : '',
    customerPhone:
      typeof raw.customerPhone === 'string' ? raw.customerPhone : '',
    modality: raw.modality === 'retirada' ? 'retirada' : 'entrega',
    address:
      raw.address && typeof raw.address === 'object'
        ? (raw.address as Order['address'])
        : undefined,
    paymentMethod: raw.paymentMethod as Order['paymentMethod'],
    changeFor: typeof raw.changeFor === 'number' ? raw.changeFor : undefined,
    generalObservation:
      typeof raw.generalObservation === 'string'
        ? raw.generalObservation
        : undefined,
    items: Array.isArray(raw.items) ? (raw.items as Order['items']) : [],
    subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : 0,
    deliveryFee: typeof raw.deliveryFee === 'number' ? raw.deliveryFee : 0,
    total: typeof raw.total === 'number' ? raw.total : 0,
    status: (raw.status as OrderStatus) ?? 'Recebido',
    isDemo: typeof raw.isDemo === 'boolean' ? raw.isDemo : false,
  };
}

export const dataStore = {
  subscribeStore(
    onData: (store: StoreSettings, existsInDb: boolean) => void,
    onError?: (err: Error) => void
  ): () => void {
    const path = `restaurants/${RESTAURANT_DOC_ID}`;
    return onSnapshot(
      doc(db, 'restaurants', RESTAURANT_DOC_ID),
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(INITIAL_STORE_SETTINGS, false);
          return;
        }
        onData(
          normalizeStore(snapshot.data() as Record<string, unknown>),
          true
        );
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, path);
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );
  },

  subscribePublicProducts(
    onData: (products: Product[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'products'),
      where('available', '==', true),
      limit(200)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) =>
          normalizeProduct(d.id, d.data() as Record<string, unknown>)
        );
        onData(sortProductsByCategoryOrder(list));
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'products');
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );
  },

  subscribeAdminProducts(
    onData: (products: Product[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(collection(db, 'products'), limit(200));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) =>
          normalizeProduct(d.id, d.data() as Record<string, unknown>)
        );
        onData(sortProductsByCategoryOrder(list));
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'products');
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );
  },

  subscribeAdminOrders(
    onData: (orders: Order[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) =>
          normalizeOrder(d.id, d.data() as Record<string, unknown>)
        );
        onData(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );
  },

  async seedInitialDataIfEmpty(): Promise<void> {
    const restaurantRef = doc(db, 'restaurants', RESTAURANT_DOC_ID);
    let restaurantSnap;
    try {
      restaurantSnap = await getDoc(restaurantRef);
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.GET,
        `restaurants/${RESTAURANT_DOC_ID}`
      );
    }

    if (restaurantSnap.exists()) {
      return;
    }

    let productsEmpty = true;
    try {
      const productsSnap = await getDocs(query(collection(db, 'products'), limit(1)));
      productsEmpty = productsSnap.empty;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
    }

    let ordersEmpty = true;
    try {
      const ordersSnap = await getDocs(query(collection(db, 'orders'), limit(1)));
      ordersEmpty = ordersSnap.empty;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    }

    try {
      const batch = writeBatch(db);
      batch.set(restaurantRef, {
        id: RESTAURANT_DOC_ID,
        name: INITIAL_STORE_SETTINGS.name,
        subtitle: INITIAL_STORE_SETTINGS.subtitle,
        logoUrl: INITIAL_STORE_SETTINGS.logoUrl ?? '',
        phone: INITIAL_STORE_SETTINGS.phone,
        address: INITIAL_STORE_SETTINGS.address,
        openingHours: INITIAL_STORE_SETTINGS.openingHours,
        deliveryEstimate: INITIAL_STORE_SETTINGS.deliveryEstimate,
        deliveryFee: INITIAL_STORE_SETTINGS.deliveryFee,
        paymentMethods: INITIAL_STORE_SETTINGS.paymentMethods,
        isOpen: INITIAL_STORE_SETTINGS.isOpen,
        updatedAt: serverTimestamp(),
      });

      if (productsEmpty) {
        for (const product of INITIAL_PRODUCTS) {
          batch.set(doc(db, 'products', product.id), {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            ingredients: product.ingredients,
            description: product.description,
            imageUrl: product.imageUrl,
            available: product.available,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      if (ordersEmpty) {
        for (const order of INITIAL_ORDERS) {
          const payload: Record<string, unknown> = {
            id: order.id,
            code: order.code,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            modality: order.modality,
            paymentMethod: order.paymentMethod,
            items: order.items,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            total: order.total,
            status: order.status,
            isDemo: true,
          };
          if (order.address) payload.address = order.address;
          if (typeof order.changeFor === 'number') payload.changeFor = order.changeFor;
          if (order.generalObservation) {
            payload.generalObservation = order.generalObservation;
          }
          batch.set(doc(db, 'orders', order.id), payload);
        }
      }

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restaurants/default');
    }
  },

  async syncCatalogCategoriesAndCoverage(): Promise<void> {
    const STORAGE_KEY = 'nexus_catalog_sync_v4';
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage.getItem(STORAGE_KEY) === 'done'
      ) {
        return;
      }
    } catch {
      // ignore storage access issues
    }

    try {
      const restaurantSnap = await getDoc(
        doc(db, 'restaurants', RESTAURANT_DOC_ID)
      );
      if (!restaurantSnap.exists()) {
        return;
      }

      const productsSnap = await getDocs(
        query(collection(db, 'products'), limit(200))
      );
      const existingProducts = productsSnap.docs.map((d) =>
        normalizeProduct(d.id, d.data() as Record<string, unknown>)
      );
      const existingById = new Map(existingProducts.map((p) => [p.id, p]));

      const batch = writeBatch(db);
      let hasChanges = false;
      if (restaurantSnap.data()?.deliveryEstimate === '30–45 min') {
        batch.update(doc(db, 'restaurants', RESTAURANT_DOC_ID), {
          deliveryEstimate: INITIAL_STORE_SETTINGS.deliveryEstimate,
          updatedAt: serverTimestamp(),
        });
        hasChanges = true;
      }
      const effectiveState = new Map<string, Product>(
        existingProducts.map((p) => [p.id, { ...p }])
      );

      // 1. Garante categoria correta para produtos existentes e corrige fotos/disponibilidade padrão antigas
      for (const product of existingProducts) {
        const updates: Record<string, unknown> = {};
        const inferred = inferExpectedCategory(product.name);
        if (inferred && product.category !== inferred) {
          updates.category = inferred;
          effectiveState.get(product.id)!.category = inferred;
        }

        const initialMatch = INITIAL_PRODUCTS.find((p) => p.id === product.id);
        if (initialMatch) {
          if (
            product.id === 'prod-5' &&
            (!product.imageUrl ||
              product.imageUrl.includes('marmita_tradicional') ||
              !product.available)
          ) {
            updates.imageUrl = initialMatch.imageUrl;
            updates.available = true;
            effectiveState.get(product.id)!.imageUrl = initialMatch.imageUrl;
            effectiveState.get(product.id)!.available = true;
          }
          if (
            product.id === 'prod-6' &&
            (!product.imageUrl || product.imageUrl.includes('frango_grelhado'))
          ) {
            updates.imageUrl = initialMatch.imageUrl;
            effectiveState.get(product.id)!.imageUrl = initialMatch.imageUrl;
          }
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          batch.update(doc(db, 'products', product.id), updates);
          hasChanges = true;
        }
      }

      // 2. Garante que prod-8 a prod-12 existam se ainda não estiverem cadastrados
      for (const extraId of ['prod-8', 'prod-9', 'prod-10', 'prod-11', 'prod-12']) {
        if (!existingById.has(extraId)) {
          const item = INITIAL_PRODUCTS.find((p) => p.id === extraId);
          if (item) {
            batch.set(doc(db, 'products', item.id), {
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              ingredients: item.ingredients,
              description: item.description,
              imageUrl: item.imageUrl,
              available: item.available,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            effectiveState.set(item.id, { ...item });
            hasChanges = true;
          }
        }
      }

      // 3. Garante que todas as categorias tenham pelo menos 1 item disponível
      for (const category of CATEGORIES) {
        const stateList = Array.from(effectiveState.values());
        const hasAvailable = stateList.some(
          (p) => p.category === category && p.available
        );
        if (hasAvailable) continue;

        const pausedInCategory = stateList.find(
          (p) => p.category === category && !p.available
        );
        if (pausedInCategory) {
          batch.update(doc(db, 'products', pausedInCategory.id), {
            available: true,
            updatedAt: serverTimestamp(),
          });
          pausedInCategory.available = true;
          hasChanges = true;
        } else {
          const fallbackProduct = INITIAL_PRODUCTS.find(
            (p) => p.category === category && !effectiveState.has(p.id)
          );
          if (fallbackProduct) {
            batch.set(doc(db, 'products', fallbackProduct.id), {
              id: fallbackProduct.id,
              name: fallbackProduct.name,
              category: fallbackProduct.category,
              price: fallbackProduct.price,
              ingredients: fallbackProduct.ingredients,
              description: fallbackProduct.description,
              imageUrl: fallbackProduct.imageUrl,
              available: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            effectiveState.set(fallbackProduct.id, {
              ...fallbackProduct,
              available: true,
            });
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        await batch.commit();
      }

      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, 'done');
        }
      } catch {
        // ignore storage access issues
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  },

  async resetDemoMenuAndStore(currentProducts: Product[]): Promise<void> {
    try {
      const restaurantRef = doc(db, 'restaurants', RESTAURANT_DOC_ID);
      const [restaurantSnap, productsSnap] = await Promise.all([
        getDoc(restaurantRef),
        getDocs(query(collection(db, 'products'), limit(200))),
      ]);

      const previousLogoStoragePath =
        restaurantSnap.exists() &&
        typeof restaurantSnap.data()?.logoStoragePath === 'string'
          ? restaurantSnap.data()?.logoStoragePath
          : undefined;

      const existingIds = new Set(productsSnap.docs.map((d) => d.id));
      const storagePathsToDelete = new Set<string>();
      for (const productDoc of productsSnap.docs) {
        const pPath = productDoc.data()?.imageStoragePath;
        if (typeof pPath === 'string' && pPath) {
          storagePathsToDelete.add(pPath);
        }
      }
      for (const existingProduct of currentProducts) {
        if (existingProduct.imageStoragePath) {
          storagePathsToDelete.add(existingProduct.imageStoragePath);
        }
      }

      const batch = writeBatch(db);
      const restaurantBase = {
        name: INITIAL_STORE_SETTINGS.name,
        subtitle: INITIAL_STORE_SETTINGS.subtitle,
        logoUrl: '',
        phone: INITIAL_STORE_SETTINGS.phone,
        address: INITIAL_STORE_SETTINGS.address,
        openingHours: INITIAL_STORE_SETTINGS.openingHours,
        deliveryEstimate: INITIAL_STORE_SETTINGS.deliveryEstimate,
        deliveryFee: INITIAL_STORE_SETTINGS.deliveryFee,
        paymentMethods: INITIAL_STORE_SETTINGS.paymentMethods,
        isOpen: INITIAL_STORE_SETTINGS.isOpen,
        updatedAt: serverTimestamp(),
      };

      if (restaurantSnap.exists()) {
        batch.update(restaurantRef, {
          ...restaurantBase,
          logoStoragePath: deleteField(),
        });
      } else {
        batch.set(restaurantRef, {
          id: RESTAURANT_DOC_ID,
          ...restaurantBase,
        });
      }

      const initialIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
      for (const existingId of existingIds) {
        if (!initialIds.has(existingId)) {
          batch.delete(doc(db, 'products', existingId));
        }
      }

      for (const product of INITIAL_PRODUCTS) {
        const productRef = doc(db, 'products', product.id);
        const productFields = {
          name: product.name,
          category: product.category,
          price: product.price,
          ingredients: product.ingredients,
          description: product.description,
          imageUrl: product.imageUrl,
          available: product.available,
          updatedAt: serverTimestamp(),
        };

        if (existingIds.has(product.id)) {
          batch.update(productRef, {
            ...productFields,
            imageStoragePath: deleteField(),
          });
        } else {
          batch.set(productRef, {
            id: product.id,
            ...productFields,
            createdAt: serverTimestamp(),
          });
        }
      }

      await batch.commit();

      if (previousLogoStoragePath) {
        await deleteStorageFileIfManaged(previousLogoStoragePath);
      }
      for (const storagePath of storagePathsToDelete) {
        await deleteStorageFileIfManaged(storagePath);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restaurants/default');
    }
  },

  async saveStore(
    settings: StoreSettings,
    previousLogoStoragePath?: string
  ): Promise<void> {
    const restaurantRef = doc(db, 'restaurants', RESTAURANT_DOC_ID);
    const methods =
      settings.paymentMethods.length > 0
        ? settings.paymentMethods
        : ALL_PAYMENT_METHODS;

    const payload: Record<string, unknown> = {
      id: RESTAURANT_DOC_ID,
      name: settings.name.trim(),
      subtitle: settings.subtitle.trim(),
      logoUrl: (settings.logoUrl ?? '').trim(),
      phone: settings.phone.trim(),
      address: settings.address.trim(),
      openingHours: settings.openingHours.trim(),
      deliveryEstimate: settings.deliveryEstimate.trim(),
      deliveryFee: settings.deliveryFee,
      paymentMethods: methods,
      isOpen: settings.isOpen,
      logoStoragePath: settings.logoStoragePath ?? '',
      updatedAt: serverTimestamp(),
    };

    try {
      const existingSnap = await getDoc(restaurantRef);
      if (existingSnap.exists()) {
        await updateDoc(restaurantRef, payload);
      } else {
        await setDoc(restaurantRef, payload);
      }

      if (
        previousLogoStoragePath &&
        previousLogoStoragePath !== settings.logoStoragePath
      ) {
        await deleteStorageFileIfManaged(previousLogoStoragePath);
      }
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `restaurants/${RESTAURANT_DOC_ID}`
      );
    }
  },

  async saveProduct(
    product: Product,
    isNew: boolean,
    previousStoragePath?: string
  ): Promise<void> {
    const productRef = doc(db, 'products', product.id);
    const basePayload: Record<string, unknown> = {
      name: product.name.trim(),
      category: product.category,
      price: product.price,
      ingredients: product.ingredients.trim(),
      description: product.description.trim(),
      imageUrl: product.imageUrl.trim(),
      available: product.available,
      imageStoragePath: product.imageStoragePath ?? '',
      updatedAt: serverTimestamp(),
    };

    try {
      if (isNew) {
        await setDoc(productRef, {
          id: product.id,
          ...basePayload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(productRef, basePayload);
      }

      if (
        previousStoragePath &&
        previousStoragePath !== product.imageStoragePath
      ) {
        await deleteStorageFileIfManaged(previousStoragePath);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  },

  async toggleProductAvailability(
    productId: string,
    available: boolean
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        available,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `products/${productId}`
      );
    }
  },

  async deleteProduct(product: Product): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', product.id));
      await deleteStorageFileIfManaged(product.imageStoragePath);
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.DELETE,
        `products/${product.id}`
      );
    }
  },

  async createOrder(
    orderInput: {
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
    },
    catalogProducts: Product[],
    store: StoreSettings
  ): Promise<{ ok: boolean; error?: string; order?: Order }> {
    if (!store.isOpen) {
      return { ok: false, error: 'O restaurante está fechado no momento.' };
    }
    if (orderInput.items.length === 0) {
      return { ok: false, error: 'A sacola está vazia.' };
    }

    const snapshotItems = [];
    for (const cartItem of orderInput.items) {
      const catalogItem = catalogProducts.find(
        (p) => p.id === cartItem.product.id
      );
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
        ...(cartItem.observation ? { observation: cartItem.observation } : {}),
      });
    }

    const subtotal =
      Math.round(
        snapshotItems.reduce(
          (acc, item) => acc + item.unitPrice * item.quantity,
          0
        ) * 100
      ) / 100;
    const deliveryFee =
      orderInput.modality === 'entrega' ? store.deliveryFee : 0;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;

    const orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const numericSuffix = `${String(Date.now()).slice(-3)}${Math.floor(
      10 + Math.random() * 90
    )}`;
    const code = `#${numericSuffix}`;

    const firestorePayload: Record<string, unknown> = {
      id: orderId,
      code,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      customerName: orderInput.customerName.trim(),
      customerPhone: orderInput.customerPhone.trim(),
      modality: orderInput.modality,
      paymentMethod: orderInput.paymentMethod,
      items: snapshotItems,
      subtotal,
      deliveryFee,
      total,
      status: 'Recebido',
      isDemo: false,
    };

    if (orderInput.modality === 'entrega' && orderInput.address) {
      firestorePayload.address = {
        street: orderInput.address.street.trim(),
        number: orderInput.address.number.trim(),
        neighborhood: orderInput.address.neighborhood.trim(),
        ...(orderInput.address.complement?.trim()
          ? { complement: orderInput.address.complement.trim() }
          : {}),
      };
    }

    if (
      orderInput.paymentMethod === 'Dinheiro' &&
      typeof orderInput.changeFor === 'number'
    ) {
      firestorePayload.changeFor = orderInput.changeFor;
    }

    if (orderInput.generalObservation?.trim()) {
      firestorePayload.generalObservation =
        orderInput.generalObservation.trim();
    }

    try {
      await setDoc(doc(db, 'orders', orderId), firestorePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    }

    const nowIso = new Date().toISOString();
    const order: Order = {
      id: orderId,
      code,
      createdAt: nowIso,
      updatedAt: nowIso,
      customerName: orderInput.customerName.trim(),
      customerPhone: orderInput.customerPhone.trim(),
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

    return { ok: true, order };
  },

  async updateOrderStatus(
    orderId: string,
    nextStatus: OrderStatus
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  },
};
