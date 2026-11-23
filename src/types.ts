export const CATEGORIES = [
  'Marmitas',
  'Pratos Executivos',
  'Porções',
  'Bebidas',
  'Sobremesas',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type OrderStatus =
  | 'Recebido'
  | 'Em preparo'
  | 'Saiu para entrega'
  | 'Concluído'
  | 'Cancelado';

export type DeliveryModality = 'entrega' | 'retirada';

export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão';

export const ALL_PAYMENT_METHODS: PaymentMethod[] = ['Pix', 'Dinheiro', 'Cartão'];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  ingredients: string;
  description: string;
  imageUrl: string;
  imageStoragePath?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  observation?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  observation?: string;
}

export interface OrderAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  updatedAt?: string;
  customerName: string;
  customerPhone: string;
  modality: DeliveryModality;
  address?: OrderAddress;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  generalObservation?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  isDemo?: boolean;
}

export interface StoreSettings {
  id?: string;
  name: string;
  subtitle: string;
  logoUrl?: string;
  logoStoragePath?: string;
  phone: string;
  address: string;
  openingHours: string;
  deliveryEstimate: string;
  deliveryFee: number;
  paymentMethods: PaymentMethod[];
  isOpen: boolean;
  updatedAt?: string;
}

export type AdminTab = 'dashboard' | 'orders' | 'menu' | 'settings';
export type AppArea = 'public' | 'admin';
