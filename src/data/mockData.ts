import { Order, Product, StoreSettings } from '../types';

export const HERO_BANNER_IMAGE =
  '/src/assets/images/hero_marmitaria_banner_1794867991248.jpg';

export const PRESET_DISH_IMAGES = [
  {
    label: 'Marmita Tradicional',
    url: '/src/assets/images/dish_marmita_tradicional_1794867991059.jpg',
  },
  {
    label: 'Frango Grelhado',
    url: '/src/assets/images/dish_frango_grelhado_1794867991780.jpg',
  },
  {
    label: 'Feijoada Completa',
    url: '/src/assets/images/dish_feijoada_completa_1794867992893.jpg',
  },
  {
    label: 'Bife à Parmegiana',
    url: '/src/assets/images/dish_bife_parmegiana_1794867992966.jpg',
  },
  {
    label: 'Pudim de Leite',
    url: '/src/assets/images/dish_pudim_caramelo_1794867992816.jpg',
  },
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  name: 'Marmitaria do Seu Raimundo',
  subtitle: 'Comida caseira feita na hora · Tempero de família',
  phone: '(11) 98765-4321',
  address: 'Rua das Flores, 240 — Centro',
  openingHours: 'Seg a Sáb · 10h30 às 15h00',
  deliveryEstimate: '30–45 min',
  deliveryFee: 5.0,
  isOpen: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Marmita Tradicional de Contra-Filé',
    category: 'Marmitas',
    price: 24.9,
    ingredients: 'Contra-filé acebolado, arroz soltinho, feijão carioca, farofa da casa e batata frita',
    description:
      'Suculento bife de contra-filé na chapa acompanhado de arroz branco, feijão carioca fresquinho, farofa crocante e fritas douradas.',
    imageUrl: '/src/assets/images/dish_marmita_tradicional_1794867991059.jpg',
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Marmita Fit de Frango Grelhado',
    category: 'Marmitas',
    price: 22.0,
    ingredients: 'Filé de frango temperado com ervas, arroz branco, feijão preto, brócolis e salada de tomate',
    description:
      'Opção leve e equilibrada com filé de peito de frango grelhado nas ervas finas, legumes no vapor e salada fresca do dia.',
    imageUrl: '/src/assets/images/dish_frango_grelhado_1794867991780.jpg',
    available: true,
  },
  {
    id: 'prod-3',
    name: 'Feijoada Completa da Casa',
    category: 'Pratos do Dia',
    price: 32.0,
    ingredients: 'Feijão preto, carnes nobres suínas, arroz branco, couve refogada, farofa de bacon e laranja',
    description:
      'Receita tradicional cozida lentamente para apurar o sabor, servida com couve na manteiga, farofa crocante e rodelas de laranja.',
    imageUrl: '/src/assets/images/dish_feijoada_completa_1794867992893.jpg',
    available: true,
  },
  {
    id: 'prod-4',
    name: 'Bife à Parmegiana Executivo',
    category: 'Pratos do Dia',
    price: 29.5,
    ingredients: 'Bife empanado crocante, molho de tomate caseiro, muçarela gratinada, arroz e fritas',
    description:
      'Clássico empanado dourado coberto com molho artesanal de tomate e queijo derretido, acompanhado de arroz soltinho e batata frita.',
    imageUrl: '/src/assets/images/dish_bife_parmegiana_1794867992966.jpg',
    available: true,
  },
  {
    id: 'prod-5',
    name: 'Porção Extra de Farofa Crocante',
    category: 'Acompanhamentos',
    price: 7.5,
    ingredients: 'Farinha de mandioca torrada, bacon em cubos, cebola dourada e cheiro-verde',
    description:
      'Porção individual generosa da nossa farofa artesanal bem temperada para reforçar qualquer marmita.',
    imageUrl: '/src/assets/images/hero_marmitaria_banner_1794867991248.jpg',
    available: true,
  },
  {
    id: 'prod-6',
    name: 'Pudim de Leite Condensado',
    category: 'Sobremesas',
    price: 9.0,
    ingredients: 'Leite condensado, leite integral, ovos e calda caramelizada',
    description:
      'Fatia cremosa e sem furinhos do clássico pudim caseiro banhado em calda dourada de caramelo.',
    imageUrl: '/src/assets/images/dish_pudim_caramelo_1794867992816.jpg',
    available: true,
  },
  {
    id: 'prod-7',
    name: 'Refrigerante Lata 350ml',
    category: 'Bebidas',
    price: 6.0,
    ingredients: 'Lata 350ml bem gelada (Guaraná ou Cola)',
    description:
      'Bebida gelada ideal para acompanhar seu almoço. Informe a preferência nas observações do pedido.',
    imageUrl: '',
    available: true,
  },
  {
    id: 'prod-8',
    name: 'Marmita de Costela Assada (Esgotada)',
    category: 'Pratos do Dia',
    price: 31.0,
    ingredients: 'Costela bovina assada lentamente, mandioca cozida, arroz e feijão',
    description:
      'Item demonstrativo marcado como indisponível: aparece apenas no painel administrativo e fica oculto para clientes.',
    imageUrl: '/src/assets/images/dish_marmita_tradicional_1794867991059.jpg',
    available: false,
  },
];

function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1045',
    code: '#1045',
    createdAt: minutesAgoIso(4),
    customerName: 'Mariana Souza',
    customerPhone: '(11) 99234-1180',
    modality: 'entrega',
    address: {
      street: 'Av. Brasil',
      number: '812',
      neighborhood: 'Jardim América',
      complement: 'Portão azul, casa 2',
    },
    paymentMethod: 'Pix',
    generalObservation: 'Mandar talher descartável, por favor.',
    items: [
      {
        productId: 'prod-1',
        name: 'Marmita Tradicional de Contra-Filé',
        unitPrice: 24.9,
        quantity: 2,
        observation: 'Uma sem cebola no bife',
      },
      {
        productId: 'prod-7',
        name: 'Refrigerante Lata 350ml',
        unitPrice: 6.0,
        quantity: 2,
        observation: 'Guaraná',
      },
    ],
    subtotal: 61.8,
    deliveryFee: 5.0,
    total: 66.8,
    status: 'Recebido',
    isDemo: true,
  },
  {
    id: 'ord-1044',
    code: '#1044',
    createdAt: minutesAgoIso(15),
    customerName: 'Carlos Henrique',
    customerPhone: '(11) 98112-4490',
    modality: 'retirada',
    paymentMethod: 'Dinheiro',
    changeFor: 50,
    items: [
      {
        productId: 'prod-4',
        name: 'Bife à Parmegiana Executivo',
        unitPrice: 29.5,
        quantity: 1,
      },
      {
        productId: 'prod-6',
        name: 'Pudim de Leite Condensado',
        unitPrice: 9.0,
        quantity: 1,
      },
    ],
    subtotal: 38.5,
    deliveryFee: 0,
    total: 38.5,
    status: 'Em preparo',
    isDemo: true,
  },
  {
    id: 'ord-1043',
    code: '#1043',
    createdAt: minutesAgoIso(29),
    customerName: 'Fernanda Lima',
    customerPhone: '(11) 97440-2201',
    modality: 'entrega',
    address: {
      street: 'Rua São Paulo',
      number: '145',
      neighborhood: 'Vila Nova',
      complement: 'Apto 34',
    },
    paymentMethod: 'Cartão',
    items: [
      {
        productId: 'prod-3',
        name: 'Feijoada Completa da Casa',
        unitPrice: 32.0,
        quantity: 1,
      },
    ],
    subtotal: 32.0,
    deliveryFee: 5.0,
    total: 37.0,
    status: 'Saiu para entrega',
    isDemo: true,
  },
  {
    id: 'ord-1042',
    code: '#1042',
    createdAt: minutesAgoIso(68),
    customerName: 'João Pedro Almeida',
    customerPhone: '(11) 99601-7788',
    modality: 'entrega',
    address: {
      street: 'Rua Tiradentes',
      number: '390',
      neighborhood: 'Centro',
    },
    paymentMethod: 'Pix',
    items: [
      {
        productId: 'prod-2',
        name: 'Marmita Fit de Frango Grelhado',
        unitPrice: 22.0,
        quantity: 2,
      },
    ],
    subtotal: 44.0,
    deliveryFee: 5.0,
    total: 49.0,
    status: 'Concluído',
    isDemo: true,
  },
  {
    id: 'ord-1041',
    code: '#1041',
    createdAt: minutesAgoIso(92),
    customerName: 'Ricardo Mendes (Exemplo Cancelado)',
    customerPhone: '(11) 98800-1212',
    modality: 'retirada',
    paymentMethod: 'Dinheiro',
    items: [
      {
        productId: 'prod-1',
        name: 'Marmita Tradicional de Contra-Filé',
        unitPrice: 24.9,
        quantity: 1,
      },
    ],
    subtotal: 24.9,
    deliveryFee: 0,
    total: 24.9,
    status: 'Cancelado',
    isDemo: true,
  },
];
