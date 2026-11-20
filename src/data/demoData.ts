import heroMarmitariaImg from '../assets/images/hero_marmitaria_caseira_1794883022253.jpg';
import pratoBifeImg from '../assets/images/prato_marmita_bife_1794883023339.jpg';
import pratoFrangoImg from '../assets/images/prato_frango_grelhado_1794883023649.jpg';
import pratoFeijoadaImg from '../assets/images/prato_feijoada_completa_1794883023944.jpg';
import pratoStrogonoffImg from '../assets/images/prato_strogonoff_frango_1794883024503.jpg';
import pratoPudimBebidaImg from '../assets/images/prato_pudim_bebida_1794883024788.jpg';
import { Dish, DishCategory, Order, StoreConfig } from '../types/ifoome';

export const HERO_BANNER_IMAGE = heroMarmitariaImg;

export const DISH_CATEGORIES: DishCategory[] = [
  'Marmitas',
  'Pratos do Dia',
  'Acompanhamentos',
  'Bebidas',
  'Sobremesas',
];

export const INITIAL_STORE_CONFIG: StoreConfig = {
  name: 'Marmitaria do Seu Raimundo',
  subtitle: 'Comida caseira feita na hora com tempero de família',
  isOpen: true,
  openingHours: 'Seg a Sáb · 10h30 às 15h00',
  phone: '(11) 98765-4321',
  pickupAddress: 'Rua das Flores, 245 · Centro',
  deliveryFee: 5.0,
  estimatedTime: '30 a 45 min',
};

export const INITIAL_DEMO_DISHES: Dish[] = [
  {
    id: 'dish-1',
    name: 'Marmita Bife Acebolado (G)',
    description:
      'Contrafilé grelhado com cebola dourada, arroz soltinho, feijão carioca temperado, batata frita crocante e salada fresca.',
    ingredients: 'Contrafilé, cebola, arroz branco, feijão carioca, batata frita, alface e tomate',
    price: 26.9,
    category: 'Marmitas',
    imageUrl: pratoBifeImg,
    available: true,
    isDemo: true,
  },
  {
    id: 'dish-2',
    name: 'Marmita Fit Frango Grelhado',
    description:
      'Peito de frango temperado com ervas finas, arroz integral, purê cremoso de mandioquinha e legumes cozidos no vapor.',
    ingredients: 'Peito de frango, ervas finas, arroz integral, mandioquinha, brócolis e cenoura',
    price: 24.5,
    category: 'Marmitas',
    imageUrl: pratoFrangoImg,
    available: true,
    isDemo: true,
  },
  {
    id: 'dish-3',
    name: 'Feijoada Completa da Casa',
    description:
      'Feijão preto cozido lentamente com carnes selecionadas, acompanhado de arroz branco, couve refogada no alho, farofa e laranja.',
    ingredients: 'Feijão preto, linguiça calabresa, carne seca, arroz, couve, farinha de mandioca e laranja',
    price: 32.0,
    category: 'Pratos do Dia',
    imageUrl: pratoFeijoadaImg,
    available: true,
    isDemo: true,
  },
  {
    id: 'dish-4',
    name: 'Strogonoff de Frango Caseiro',
    description:
      'Cubos de frango ao molho cremoso de tomate com champignon, servidos com arroz branco soltinho e batata palha crocante.',
    ingredients: 'Peito de frango, creme de leite, molho de tomate, champignon, arroz branco e batata palha',
    price: 25.0,
    category: 'Pratos do Dia',
    imageUrl: pratoStrogonoffImg,
    available: true,
    isDemo: true,
  },
  {
    id: 'dish-5',
    name: 'Farofa Especial com Bacon (Porção)',
    description:
      'Porção extra de farofa crocante na manteiga com cubinhos de bacon e cheiro-verde fresco para acompanhar sua marmita.',
    ingredients: 'Farinha de mandioca torrada, bacon, manteiga, cebola e cheiro-verde',
    price: 8.5,
    category: 'Acompanhamentos',
    imageUrl: heroMarmitariaImg,
    available: true,
    isDemo: true,
  },
  {
    id: 'dish-6',
    name: 'Suco Natural de Laranja 400ml',
    description:
      'Suco espremido na hora com laranjas selecionadas, servido bem gelado sem adição de conservantes.',
    ingredients: 'Laranja pêra fresca e gelo',
    price: 9.0,
    category: 'Bebidas',
    imageUrl: pratoPudimBebidaImg,
    available: true,
    isDemo: true,
  },
  {
    id: 'dish-7',
    name: 'Pudim de Leite Condensado',
    description:
      'Fatia generosa de pudim tradicional bem cremoso com calda dourada de caramelo artesanal.',
    ingredients: 'Leite condensado, leite integral, ovos e açúcar caramelizado',
    price: 10.0,
    category: 'Sobremesas',
    imageUrl: pratoPudimBebidaImg,
    available: false, // Exemplo de prato pausado para demonstrar RN-01
    isDemo: true,
  },
];

function minutesAgoISO(minutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - minutes);
  return now.toISOString();
}

export const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-1044',
    code: '#1044',
    createdAt: minutesAgoISO(6),
    customerName: 'Mariana Oliveira',
    customerPhone: '(11) 99123-4410',
    deliveryMode: 'entrega',
    address: {
      street: 'Rua Dom Pedro II',
      number: '184',
      neighborhood: 'Vila Nova',
      complement: 'Portão cinza, campainha 2',
    },
    paymentMethod: 'Pix',
    generalObservation: 'Mandar talher descartável, por favor.',
    items: [
      {
        dishId: 'dish-1',
        name: 'Marmita Bife Acebolado (G)',
        unitPrice: 26.9,
        quantity: 2,
        observation: 'Uma sem cebola',
      },
      {
        dishId: 'dish-6',
        name: 'Suco Natural de Laranja 400ml',
        unitPrice: 9.0,
        quantity: 1,
      },
    ],
    subtotal: 62.8,
    deliveryFee: 5.0,
    total: 67.8,
    status: 'Recebido',
    isDemo: true,
  },
  {
    id: 'ord-1043',
    code: '#1043',
    createdAt: minutesAgoISO(18),
    customerName: 'Carlos Eduardo Lima',
    customerPhone: '(11) 98412-0933',
    deliveryMode: 'retirada',
    paymentMethod: 'Dinheiro',
    changeFor: 50,
    items: [
      {
        dishId: 'dish-3',
        name: 'Feijoada Completa da Casa',
        unitPrice: 32.0,
        quantity: 1,
        observation: 'Caprichar na farofa',
      },
    ],
    subtotal: 32.0,
    deliveryFee: 0,
    total: 32.0,
    status: 'Em preparo',
    isDemo: true,
  },
  {
    id: 'ord-1042',
    code: '#1042',
    createdAt: minutesAgoISO(34),
    customerName: 'Ana Paula Ferreira',
    customerPhone: '(11) 97721-8854',
    deliveryMode: 'entrega',
    address: {
      street: 'Av. Brasil',
      number: '920',
      neighborhood: 'Centro',
      complement: 'Loja de tecidos',
    },
    paymentMethod: 'Cartão',
    items: [
      {
        dishId: 'dish-4',
        name: 'Strogonoff de Frango Caseiro',
        unitPrice: 25.0,
        quantity: 1,
      },
      {
        dishId: 'dish-2',
        name: 'Marmita Fit Frango Grelhado',
        unitPrice: 24.5,
        quantity: 1,
      },
    ],
    subtotal: 49.5,
    deliveryFee: 5.0,
    total: 54.5,
    status: 'Saiu para entrega',
    isDemo: true,
  },
  {
    id: 'ord-1041',
    code: '#1041',
    createdAt: minutesAgoISO(75),
    customerName: 'Roberto Santos',
    customerPhone: '(11) 99540-1120',
    deliveryMode: 'retirada',
    paymentMethod: 'Pix',
    items: [
      {
        dishId: 'dish-1',
        name: 'Marmita Bife Acebolado (G)',
        unitPrice: 26.9,
        quantity: 1,
      },
    ],
    subtotal: 26.9,
    deliveryFee: 0,
    total: 26.9,
    status: 'Concluído',
    isDemo: true,
  },
  {
    id: 'ord-1040',
    code: '#1040',
    createdAt: minutesAgoISO(92),
    customerName: 'Juliana Mendes (Exemplo cancelado)',
    customerPhone: '(11) 98801-3302',
    deliveryMode: 'entrega',
    address: {
      street: 'Rua Sete de Setembro',
      number: '55',
      neighborhood: 'Jardim Paulista',
    },
    paymentMethod: 'Dinheiro',
    items: [
      {
        dishId: 'dish-4',
        name: 'Strogonoff de Frango Caseiro',
        unitPrice: 25.0,
        quantity: 1,
      },
    ],
    subtotal: 25.0,
    deliveryFee: 5.0,
    total: 30.0,
    status: 'Cancelado',
    isDemo: true,
  },
];
