import { ALL_PAYMENT_METHODS, DeliveryModality, PaymentMethod } from '../types';

const CUSTOMER_CHECKOUT_STORAGE_KEY = 'nexus_customer_checkout_profile_v1';

export interface SavedCustomerCheckoutData {
  customerName: string;
  customerPhone: string;
  modality: DeliveryModality;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  paymentMethod?: PaymentMethod;
}

export function loadSavedCustomerData(): SavedCustomerCheckoutData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedCustomerCheckoutData>;
    if (!parsed || typeof parsed !== 'object') return null;

    const savedPayment =
      typeof parsed.paymentMethod === 'string' &&
      ALL_PAYMENT_METHODS.includes(parsed.paymentMethod as PaymentMethod)
        ? (parsed.paymentMethod as PaymentMethod)
        : undefined;

    return {
      customerName: typeof parsed.customerName === 'string' ? parsed.customerName : '',
      customerPhone: typeof parsed.customerPhone === 'string' ? parsed.customerPhone : '',
      modality: parsed.modality === 'retirada' ? 'retirada' : 'entrega',
      street: typeof parsed.street === 'string' ? parsed.street : '',
      number: typeof parsed.number === 'string' ? parsed.number : '',
      neighborhood: typeof parsed.neighborhood === 'string' ? parsed.neighborhood : '',
      complement: typeof parsed.complement === 'string' ? parsed.complement : '',
      paymentMethod: savedPayment,
    };
  } catch {
    return null;
  }
}

export function saveCustomerData(data: SavedCustomerCheckoutData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CUSTOMER_CHECKOUT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function clearSavedCustomerData(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CUSTOMER_CHECKOUT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
