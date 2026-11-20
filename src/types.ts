export type Category =
  | 'Marmitas'
  | 'Pratos do Dia'
  | 'Acompanhamentos'
  | 'Bebidas'
  | 'Sobremesas';

export type OrderStatus =
  | 'Recebido'
  | 'Em preparo'
  | 'Saiu para entrega'
  | 'Concluído'
  | 'Cancelado';

export type DeliveryType = 'Entrega' | 'Retirada';

export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: Category;
  imageUrl: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
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
  createdAt: string; // ISO string
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: OrderAddress;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  generalNotes?: string;
}

export interface StoreConfig {
  name: string;
  subtitle: string;
  phone: string;
  openingHours: string;
  address: string;
  deliveryFee: number;
  isOpen: boolean;
}

export type AppArea = 'public' | 'admin';
export type AdminTab = 'dashboard' | 'orders' | 'menu' | 'settings';
