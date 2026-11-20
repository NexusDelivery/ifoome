import { Category, MenuItem, Order, StoreConfig } from '../types';

export const MENU_CATEGORIES: Category[] = [
  'Marmitas',
  'Pratos do Dia',
  'Acompanhamentos',
  'Bebidas',
  'Sobremesas',
];

export const HERO_BANNER_IMAGE = '/src/assets/images/hero_marmitaria_table_1794872871052.jpg';

export const DISH_IMAGE_GALLERY = [
  {
    label: 'Marmita Frango Grelhado',
    url: '/src/assets/images/dish_frango_grelhado_1794872871649.jpg',
  },
  {
    label: 'Bife Acebolado',
    url: '/src/assets/images/dish_bife_acebolado_1794872872311.jpg',
  },
  {
    label: 'Feijoada Completa',
    url: '/src/assets/images/dish_feijoada_completa_1794872872506.jpg',
  },
  {
    label: 'Mandioca Frita',
    url: '/src/assets/images/dish_mandioca_frita_1794872873472.jpg',
  },
  {
    label: 'Suco de Laranja Natural',
    url: '/src/assets/images/dish_suco_laranja_1794872873636.jpg',
  },
  {
    label: 'Pudim de Leite',
    url: '/src/assets/images/dish_pudim_caramelo_1794872873689.jpg',
  },
];

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  name: 'Marmitaria do Seu Raimundo',
  subtitle: 'Comida caseira feita na hora, com tempero de família.',
  phone: '(11) 98765-4321',
  openingHours: 'Seg a Sáb · 11h00 às 14h30',
  address: 'Rua das Flores, 240 — Centro',
  deliveryFee: 5.0,
  isOpen: true,
};

export const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Marmita Executiva de Frango Grelhado',
    description:
      'Filé de peito de frango grelhado na chapa com ervas frescas, acompanhado de arroz soltinho, feijão carioca caseiro, farofa crocante e salada fresca.',
    ingredients: 'Peito de frango, arroz branco, feijão carioca, farofa temperada, alface e tomate',
    price: 22.9,
    category: 'Marmitas',
    imageUrl: '/src/assets/images/dish_frango_grelhado_1794872871649.jpg',
    available: true,
  },
  {
    id: 'item-2',
    name: 'Marmita de Bife Acebolado',
    description:
      'Suculento bife bovino acebolado na manteiga de garrafa, servido com arroz branco, feijão preto bem temperado e cubos de batata corada.',
    ingredients: 'Contra-filé bovino, cebola caramelizada, arroz, feijão preto, batata corada',
    price: 26.5,
    category: 'Marmitas',
    imageUrl: '/src/assets/images/dish_bife_acebolado_1794872872311.jpg',
    available: true,
  },
  {
    id: 'item-3',
    name: 'Feijoada Completa da Casa',
    description:
      'Feijoada tradicional preparada em fogo lento com carnes selecionadas, acompanhada de arroz branco, couve refogada no alho, farofa de bacon e laranja.',
    ingredients: 'Feijão preto, costelinha, paio, calabresa, arroz, couve mineira, farofa e laranja',
    price: 32.0,
    category: 'Pratos do Dia',
    imageUrl: '/src/assets/images/dish_feijoada_completa_1794872872506.jpg',
    available: true,
  },
  {
    id: 'item-4',
    name: 'Porção de Mandioca Frita Crocante',
    description:
      'Tiras de mandioca selecionada fritas na hora até ficarem douradas por fora e macias por dentro, finalizadas com salsinha fresca.',
    ingredients: 'Mandioca amarela, sal marinho, salsinha fresca',
    price: 14.0,
    category: 'Acompanhamentos',
    imageUrl: '/src/assets/images/dish_mandioca_frita_1794872873472.jpg',
    available: true,
  },
  {
    id: 'item-5',
    name: 'Suco Natural de Laranja 400ml',
    description:
      'Suco espremido na hora com laranjas selecionadas, bem gelado e sem adição de conservantes.',
    ingredients: 'Laranja-pera fresca e gelo',
    price: 8.5,
    category: 'Bebidas',
    imageUrl: '/src/assets/images/dish_suco_laranja_1794872873636.jpg',
    available: true,
  },
  {
    id: 'item-6',
    name: 'Pudim de Leite Condensado',
    description:
      'Fatia generosa de pudim cremoso tradicional com calda artesanal de caramelo dourado.',
    ingredients: 'Leite condensado, leite integral, ovos e açúcar caramelizado',
    price: 9.0,
    category: 'Sobremesas',
    imageUrl: '/src/assets/images/dish_pudim_caramelo_1794872873689.jpg',
    available: true,
  },
  {
    id: 'item-7',
    name: 'Marmita de Frango à Parmegiana',
    description:
      'Filé empanado coberto com molho de tomate caseiro e queijo derretido. (Exemplo de item pausado para demonstração do painel administrativo.)',
    ingredients: 'Filé de frango empanado, molho de tomate, muçarela, arroz e batata',
    price: 27.9,
    category: 'Marmitas',
    imageUrl: '/src/assets/images/dish_frango_grelhado_1794872871649.jpg',
    available: false,
  },
];

function minutesAgoIso(minutes: number): string {
  const date = new Date(Date.now() - minutes * 60 * 1000);
  return date.toISOString();
}

export const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-104',
    code: '#0104',
    createdAt: minutesAgoIso(6),
    customerName: 'Mariana Souza',
    customerPhone: '(11) 99234-1188',
    deliveryType: 'Entrega',
    address: {
      street: 'Av. Brasil',
      number: '512',
      neighborhood: 'Vila Nova',
      complement: 'Portão cinza, apto 2',
    },
    paymentMethod: 'Pix',
    items: [
      {
        menuItemId: 'item-1',
        name: 'Marmita Executiva de Frango Grelhado',
        unitPrice: 22.9,
        quantity: 2,
        notes: 'Uma sem farofa, por favor',
      },
      {
        menuItemId: 'item-5',
        name: 'Suco Natural de Laranja 400ml',
        unitPrice: 8.5,
        quantity: 1,
      },
    ],
    subtotal: 54.3,
    deliveryFee: 5.0,
    total: 59.3,
    status: 'Recebido',
  },
  {
    id: 'ord-103',
    code: '#0103',
    createdAt: minutesAgoIso(18),
    customerName: 'Carlos Eduardo',
    customerPhone: '(11) 97112-8840',
    deliveryType: 'Retirada',
    paymentMethod: 'Cartão',
    items: [
      {
        menuItemId: 'item-3',
        name: 'Feijoada Completa da Casa',
        unitPrice: 32.0,
        quantity: 1,
      },
      {
        menuItemId: 'item-6',
        name: 'Pudim de Leite Condensado',
        unitPrice: 9.0,
        quantity: 1,
      },
    ],
    subtotal: 41.0,
    deliveryFee: 0,
    total: 41.0,
    status: 'Em preparo',
    generalNotes: 'Retira às 12h20 no balcão',
  },
  {
    id: 'ord-102',
    code: '#0102',
    createdAt: minutesAgoIso(34),
    customerName: 'Dona Helena',
    customerPhone: '(11) 98841-2099',
    deliveryType: 'Entrega',
    address: {
      street: 'Rua Rui Barbosa',
      number: '88',
      neighborhood: 'Centro',
    },
    paymentMethod: 'Dinheiro',
    changeFor: 50.0,
    items: [
      {
        menuItemId: 'item-2',
        name: 'Marmita de Bife Acebolado',
        unitPrice: 26.5,
        quantity: 1,
      },
    ],
    subtotal: 26.5,
    deliveryFee: 5.0,
    total: 31.5,
    status: 'Saiu para entrega',
  },
  {
    id: 'ord-101',
    code: '#0101',
    createdAt: minutesAgoIso(75),
    customerName: 'Lucas Ferreira',
    customerPhone: '(11) 96500-3321',
    deliveryType: 'Entrega',
    address: {
      street: 'Rua São Pedro',
      number: '140',
      neighborhood: 'Jardim América',
    },
    paymentMethod: 'Pix',
    items: [
      {
        menuItemId: 'item-1',
        name: 'Marmita Executiva de Frango Grelhado',
        unitPrice: 22.9,
        quantity: 1,
      },
      {
        menuItemId: 'item-4',
        name: 'Porção de Mandioca Frita Crocante',
        unitPrice: 14.0,
        quantity: 1,
      },
    ],
    subtotal: 36.9,
    deliveryFee: 5.0,
    total: 41.9,
    status: 'Concluído',
  },
  {
    id: 'ord-100',
    code: '#0100',
    createdAt: minutesAgoIso(95),
    customerName: 'Roberto Lima',
    customerPhone: '(11) 99100-0011',
    deliveryType: 'Retirada',
    paymentMethod: 'Dinheiro',
    items: [
      {
        menuItemId: 'item-2',
        name: 'Marmita de Bife Acebolado',
        unitPrice: 26.5,
        quantity: 1,
      },
    ],
    subtotal: 26.5,
    deliveryFee: 0,
    total: 26.5,
    status: 'Cancelado',
    generalNotes: 'Cliente desistiu antes do preparo (exemplo cancelado)',
  },
];
