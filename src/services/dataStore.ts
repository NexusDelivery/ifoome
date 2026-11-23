import {
  collection,
  deleteDoc,
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
  type CartItem,
  type DeliveryModality,
  type Order,
  type OrderStatus,
  type PaymentMethod,
  type Product,
  type StoreSettings,
} from '../types';
import { deleteStorageFileIfManaged } from './storageService';

const RESTAURANT_DOC_ID = 'default';

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
    logoUrl: typeof raw.logoUrl === 'string' ? raw.logoUrl : '',
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
        ? raw.deliveryEstimate
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
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : '',
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
        list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        onData(list);
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
        list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        onData(list);
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

  async resetDemoMenuAndStore(currentProducts: Product[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      const restaurantRef = doc(db, 'restaurants', RESTAURANT_DOC_ID);
      batch.set(restaurantRef, {
        id: RESTAURANT_DOC_ID,
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
      });

      const initialIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
      for (const existingProduct of currentProducts) {
        if (!initialIds.has(existingProduct.id)) {
          batch.delete(doc(db, 'products', existingProduct.id));
        }
      }

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

      await batch.commit();

      for (const existingProduct of currentProducts) {
        if (existingProduct.imageStoragePath) {
          await deleteStorageFileIfManaged(existingProduct.imageStoragePath);
        }
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
