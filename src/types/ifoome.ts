export type DishCategory =
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

export type DeliveryMode = 'entrega' | 'retirada';

export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão';

export type AppArea = 'public' | 'admin';

export type AdminSection = 'dashboard' | 'pedidos' | 'cardapio' | 'configuracoes';

export type PublicView = 'cardapio' | 'checkout' | 'confirmacao' | 'acompanhar';

export interface Dish {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: DishCategory;
  imageUrl: string;
  available: boolean;
  isDemo?: boolean;
}

export interface CartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  observation: string;
  imageUrl: string;
}

export interface OrderItemSnapshot {
  dishId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  observation?: string;
}

export interface DeliveryAddress {
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
  deliveryMode: DeliveryMode;
  address?: DeliveryAddress;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  generalObservation?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  isDemo?: boolean;
}

export interface StoreConfig {
  name: string;
  subtitle: string;
  isOpen: boolean;
  openingHours: string;
  phone: string;
  pickupAddress: string;
  deliveryFee: number;
  estimatedTime: string;
}
