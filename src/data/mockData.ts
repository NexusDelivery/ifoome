import heroBannerImg from '../assets/images/hero_marmitaria_banner_1794867991248.jpg';
import marmitaTradicionalImg from '../assets/images/dish_marmita_tradicional_1794867991059.jpg';
import frangoGrelhadoImg from '../assets/images/dish_frango_grelhado_1794867991780.jpg';
import feijoadaCompletaImg from '../assets/images/dish_feijoada_completa_1794867992893.jpg';
import bifeParmegianaImg from '../assets/images/dish_bife_parmegiana_1794867992966.jpg';
import pudimCarameloImg from '../assets/images/dish_pudim_caramelo_1794867992816.jpg';
import sucoLaranjaImg from '../assets/images/dish_suco_laranja_1794872873636.jpg';
import brownieChocolateImg from '../assets/images/dish_brownie_chocolate_1795390815351.jpg';
import mandiocaFritaImg from '../assets/images/dish_mandioca_frita_1794872873472.jpg';
import guaranaLataImg from '../assets/images/dish_guarana_lata_1795391688699.jpg';
import strogonoffFrangoImg from '../assets/images/prato_strogonoff_frango_1794883024503.jpg';
import contraFileAceboladoImg from '../assets/images/dish_bife_acebolado_1794872872311.jpg';
import calabresaAceboladaImg from '../assets/images/dish_calabresa_acebolada_1795482166193.jpg';
import { Order, Product, StoreSettings } from '../types';

export const HERO_BANNER_IMAGE = heroBannerImg;

export const PRESET_DISH_IMAGES = [
  { label: 'Marmita Tradicional', url: marmitaTradicionalImg },
  { label: 'Frango Grelhado', url: frangoGrelhadoImg },
  { label: 'Strogonoff de Frango', url: strogonoffFrangoImg },
  { label: 'Feijoada Completa', url: feijoadaCompletaImg },
  { label: 'Bife à Parmegiana', url: bifeParmegianaImg },
  { label: 'Contra-Filé Acebolado', url: contraFileAceboladoImg },
  { label: 'Porção de Mandioca', url: mandiocaFritaImg },
  { label: 'Calabresa Acebolada', url: calabresaAceboladaImg },
  { label: 'Refrigerante Guaraná', url: guaranaLataImg },
  { label: 'Suco Natural de Laranja', url: sucoLaranjaImg },
  { label: 'Pudim Caseiro', url: pudimCarameloImg },
  { label: 'Brownie com Calda', url: brownieChocolateImg },
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  id: 'default',
  name: 'Marmitaria do Seu Raimundo',
  subtitle:
    'Comida caseira feita na hora com tempero de família. Marmitas caprichadas, pratos executivos e entrega rápida no bairro.',
  logoUrl: '',
  phone: '(11) 98765-4321',
  address: 'Rua das Flores, 245 — Vila Nova',
  openingHours: 'Seg a Sáb · 10h30 às 15h00',
  deliveryEstimate: '20-30 min',
  deliveryFee: 5.0,
  paymentMethods: ['Pix', 'Dinheiro', 'Cartão'],
  isOpen: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Marmita Tradicional da Casa (G)',
    category: 'Marmitas',
    price: 22.9,
    ingredients:
      'Arroz soltinho, feijão carioca temperado, bife acebolado na chapa, farofa crocante e batata frita.',
    description:
      'A campeã de pedidos do Seu Raimundo: carne macia acebolada na chapa com arroz, feijão fresquinho e acompanhamentos caseiros.',
    imageUrl: marmitaTradicionalImg,
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Marmita Frango Grelhado Fitness',
    category: 'Marmitas',
    price: 21.5,
    ingredients:
      'Filé de peito de frango grelhado nas ervas, arroz integral ou branco, feijão, legumes salteados e salada verde.',
    description:
      'Refeição leve, equilibrada e bem servida com frango grelhado suculento e legumes frescos do dia.',
    imageUrl: frangoGrelhadoImg,
    available: true,
  },
  {
    id: 'prod-10',
    name: 'Marmita Strogonoff de Frango (G)',
    category: 'Marmitas',
    price: 24.9,
    ingredients:
      'Cubos de frango ao molho cremoso com champignon, arroz branco soltinho e batata palha crocante.',
    description:
      'Clássico strogonoff cremoso preparado na hora, servido bem quentinho com arroz soltinho e bastante batata palha.',
    imageUrl: strogonoffFrangoImg,
    available: true,
  },
  {
    id: 'prod-3',
    name: 'Feijoada Completa do Raimundo',
    category: 'Pratos Executivos',
    price: 32.0,
    ingredients:
      'Feijão preto com carnes nobres, arroz branco, couve refogada no alho, farofa da casa, torresmo e laranja.',
    description:
      'Feijoada cozida lentamente no capricho, acompanhada de couve crocante, farofa temperada e rodelas de laranja.',
    imageUrl: feijoadaCompletaImg,
    available: true,
  },
  {
    id: 'prod-4',
    name: 'Bife à Parmegiana Executivo',
    category: 'Pratos Executivos',
    price: 29.9,
    ingredients:
      'Bife empanado crocante, molho de tomate caseiro, queijo mussarela derretido, arroz branco e fritas.',
    description:
      'Empanado na hora e coberto com molho artesanal de tomates maduros e bastante queijo gratinado.',
    imageUrl: bifeParmegianaImg,
    available: true,
  },
  {
    id: 'prod-11',
    name: 'Contra-Filé Acebolado Executivo',
    category: 'Pratos Executivos',
    price: 34.9,
    ingredients:
      'Contra-filé grelhado com cebolas caramelizadas, arroz branco, feijão temperado e batatas rústicas douradas.',
    description:
      'Corte macio grelhado no ponto certo com cebolas douradas, acompanhado de arroz, feijão caseiro e batatas assadas.',
    imageUrl: contraFileAceboladoImg,
    available: true,
  },
  {
    id: 'prod-5',
    name: 'Porção de Torresmo e Mandioca',
    category: 'Porções',
    price: 19.0,
    ingredients: 'Mandioca cozida e frita na manteiga de garrafa com torresmo pururuca.',
    description:
      'Porção generosa para acompanhar seu almoço: mandioca macia por dentro e torresmo bem sequinho.',
    imageUrl: mandiocaFritaImg,
    available: true,
  },
  {
    id: 'prod-12',
    name: 'Porção de Calabresa Acebolada na Chapa',
    category: 'Porções',
    price: 26.0,
    ingredients:
      'Linguiça calabresa defumada fatiada, cebola dourada na chapa, cheiro-verde fresco e limão.',
    description:
      'Porção generosa de calabresa bem douradinha na chapa com cebolas caramelizadas e toque de salsinha.',
    imageUrl: calabresaAceboladaImg,
    available: true,
  },
  {
    id: 'prod-6',
    name: 'Refrigerante Guaraná Lata 350ml',
    category: 'Bebidas',
    price: 6.0,
    ingredients: 'Lata 350ml servida bem gelada.',
    description: 'Guaraná tradicional geladinho para acompanhar sua marmita.',
    imageUrl: guaranaLataImg,
    available: true,
  },
  {
    id: 'prod-8',
    name: 'Suco Natural de Laranja 400ml',
    category: 'Bebidas',
    price: 9.9,
    ingredients: 'Laranjas frescas selecionadas espremidas na hora, com gelo opcional.',
    description:
      'Suco 100% natural, refrescante e sem adição de conservantes, preparado na hora do pedido.',
    imageUrl: sucoLaranjaImg,
    available: true,
  },
  {
    id: 'prod-7',
    name: 'Pudim de Leite Condensado',
    category: 'Sobremesas',
    price: 9.5,
    ingredients: 'Leite condensado, ovos, leite integral e calda de caramelo.',
    description:
      'Sobremesa clássica da casa, lisinha e cremosa, finalizada com calda dourada de caramelo.',
    imageUrl: pudimCarameloImg,
    available: true,
  },
  {
    id: 'prod-9',
    name: 'Brownie de Chocolate com Calda',
    category: 'Sobremesas',
    price: 14.9,
    ingredients:
      'Chocolate meio amargo, manteiga, ovos, farinha, nozes tostadas e ganache cremosa.',
    description:
      'Brownie artesanal macio por dentro e levemente crocante por fora, finalizado com calda de chocolate e nozes.',
    imageUrl: brownieChocolateImg,
    available: true,
  },
];

function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-demo-1045',
    code: '#1045',
    createdAt: minutesAgoIso(6),
    customerName: 'Mariana Souza',
    customerPhone: '(11) 99123-4567',
    modality: 'entrega',
    address: {
      street: 'Rua das Acácias',
      number: '118',
      neighborhood: 'Vila Nova',
      complement: 'Portão azul',
    },
    paymentMethod: 'Pix',
    generalObservation: 'Tocar a campainha ao chegar.',
    items: [
      {
        productId: 'prod-1',
        name: 'Marmita Tradicional da Casa (G)',
        unitPrice: 22.9,
        quantity: 2,
        observation: 'Sem cebola em uma delas',
      },
      {
        productId: 'prod-6',
        name: 'Refrigerante Guaraná Lata 350ml',
        unitPrice: 6.0,
        quantity: 2,
      },
    ],
    subtotal: 57.8,
    deliveryFee: 5.0,
    total: 62.8,
    status: 'Recebido',
    isDemo: true,
  },
  {
    id: 'ord-demo-1044',
    code: '#1044',
    createdAt: minutesAgoIso(18),
    customerName: 'Carlos Eduardo Lima',
    customerPhone: '(11) 97744-8822',
    modality: 'retirada',
    paymentMethod: 'Cartão',
    items: [
      {
        productId: 'prod-3',
        name: 'Feijoada Completa do Raimundo',
        unitPrice: 32.0,
        quantity: 1,
      },
      {
        productId: 'prod-7',
        name: 'Pudim de Leite Condensado',
        unitPrice: 9.5,
        quantity: 1,
      },
    ],
    subtotal: 41.5,
    deliveryFee: 0,
    total: 41.5,
    status: 'Em preparo',
    isDemo: true,
  },
  {
    id: 'ord-demo-1043',
    code: '#1043',
    createdAt: minutesAgoIso(34),
    customerName: 'Fernanda Alves',
    customerPhone: '(11) 98331-2090',
    modality: 'entrega',
    address: {
      street: 'Av. Brasil',
      number: '940',
      neighborhood: 'Centro',
      complement: 'Loja 2',
    },
    paymentMethod: 'Dinheiro',
    changeFor: 50,
    items: [
      {
        productId: 'prod-4',
        name: 'Bife à Parmegiana Executivo',
        unitPrice: 29.9,
        quantity: 1,
      },
    ],
    subtotal: 29.9,
    deliveryFee: 5.0,
    total: 34.9,
    status: 'Saiu para entrega',
    isDemo: true,
  },
  {
    id: 'ord-demo-1042',
    code: '#1042',
    createdAt: minutesAgoIso(62),
    customerName: 'João Pedro Martins',
    customerPhone: '(11) 99550-1122',
    modality: 'retirada',
    paymentMethod: 'Pix',
    items: [
      {
        productId: 'prod-2',
        name: 'Marmita Frango Grelhado Fitness',
        unitPrice: 21.5,
        quantity: 2,
      },
    ],
    subtotal: 43.0,
    deliveryFee: 0,
    total: 43.0,
    status: 'Concluído',
    isDemo: true,
  },
  {
    id: 'ord-demo-1041',
    code: '#1041',
    createdAt: minutesAgoIso(85),
    customerName: 'Patrícia Gomes',
    customerPhone: '(11) 96412-9087',
    modality: 'entrega',
    address: {
      street: 'Rua Ipê Roxo',
      number: '45',
      neighborhood: 'Jardim América',
    },
    paymentMethod: 'Pix',
    items: [
      {
        productId: 'prod-1',
        name: 'Marmita Tradicional da Casa (G)',
        unitPrice: 22.9,
        quantity: 1,
      },
    ],
    subtotal: 22.9,
    deliveryFee: 5.0,
    total: 27.9,
    status: 'Cancelado',
    isDemo: true,
  },
];
