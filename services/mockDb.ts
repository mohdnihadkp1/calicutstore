import { Product, StoreConfig } from '../types';

const STORAGE_KEY = 'calicut_store_products';
const AUTH_KEY = 'calicut_store_auth';
const CONFIG_KEY = 'calicut_store_config';

// Simple non-reversible hash function to hide the code from plain text inspection
// Cyrb53 algorithm (simple and decent for this use case)
const hashString = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// The hash for 'Bismillah' generated using the function above
const SECRET_HASH = 8608954734346; 

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Wallet',
    description: 'Handcrafted genuine leather wallet with RFID protection. Available in multiple finishes.',
    price: 1499,
    salePrice: 999,
    discountPercent: 33,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-18bd03048ca3?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1627123424574-18bd03048ca3?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1517254797898-04ecd252b33f?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Fashion',
    stock: 50,
    active: true,
    featured: true,
    createdAt: Date.now(),
    variants: [
        { id: 'v1', name: 'Black Leather', price: 999, stock: 20 },
        { id: 'v2', name: 'Brown Leather', price: 999, stock: 30 }
    ]
  },
  {
    id: '2',
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Immersive sound experience with 30-hour battery life.',
    price: 5999,
    salePrice: 4499,
    discountPercent: 25,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    images: [
       'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
       'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Electronics',
    stock: 15,
    active: true,
    featured: true,
    createdAt: Date.now() - 100000,
    variants: [
        { id: 'v1', name: 'Matte Black', price: 4499, stock: 10 },
        { id: 'v2', name: 'Silver', price: 4699, stock: 5 }
    ]
  },
  {
    id: '3',
    name: 'Minimalist Wall Clock',
    description: 'Modern design silent sweep quartz movement wall clock.',
    price: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
    category: 'Home Decor',
    stock: 30,
    active: true,
    featured: false,
    createdAt: Date.now() - 200000
  },
  {
    id: '4',
    name: 'Classic Running Shoes',
    description: 'Lightweight and breathable mesh running shoes for daily use.',
    price: 2999,
    salePrice: 2499,
    discountPercent: 16,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Fashion',
    stock: 100,
    active: true,
    featured: true,
    createdAt: Date.now() - 300000,
    variants: [
        { id: 'v1', name: 'Size 8', price: 2499, stock: 20 },
        { id: 'v2', name: 'Size 9', price: 2499, stock: 20 },
        { id: 'v3', name: 'Size 10', price: 2499, stock: 20 }
    ]
  },
  {
    id: '5',
    name: 'Organic Premium Almonds (1kg)',
    description: 'High-quality raw almonds, rich in protein and fiber. Perfect for healthy snacking.',
    price: 999,
    salePrice: 850,
    discountPercent: 15,
    imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=400',
    category: 'Groceries & Food',
    stock: 200,
    active: true,
    featured: true,
    createdAt: Date.now() - 350000
  },
  {
    id: '6',
    name: 'Organic Face Serum',
    description: 'Vitamin C enriched serum for glowing skin.',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    category: 'Beauty & Personal Care',
    stock: 45,
    active: true,
    featured: true,
    createdAt: Date.now() - 500000
  }
];

const DEFAULT_CONFIG: StoreConfig = {
  heroTitle: "Your Ultimate",
  heroHighlight: "Shopping Hub",
  heroSubtitle: "Discover a world of premium products curated for the modern aesthetic. Direct WhatsApp ordering for personalized service.",
  heroImages: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop", // Red Shoe
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop", // Headphones
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop", // Watch
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop"  // Camera
  ],
  contact: {
    phone: "+91 98467 50898",
    whatsapp: "919846750898",
    email: "mohdnihadkp@gmail.com",
    instagram: "https://www.instagram.com/mohdnihadkp",
    twitter: "https://x.com/mohdnihadkp",
    address: "Calicut, Kerala, India - 673001"
  }
};

export const initStore = () => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
};

export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing products from local storage", e);
    return INITIAL_PRODUCTS;
  }
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const saveProduct = (product: Product): Product => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  // Calculate discount if sale price exists
  if (product.salePrice && product.price > 0) {
    product.discountPercent = Math.round(((product.price - product.salePrice) / product.price) * 100);
  } else {
    product.discountPercent = 0;
  }

  // Ensure arrays are initialized
  if (!product.images) product.images = [];
  if (!product.variants) product.variants = [];

  if (index >= 0) {
    products[index] = { ...product, active: Boolean(product.active), featured: Boolean(product.featured) };
  } else {
    products.push({ ...product, createdAt: Date.now(), active: Boolean(product.active), featured: Boolean(product.featured) });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return product;
};

// Returns the updated list of products for immediate UI updates
export const deleteProduct = (id: string): Product[] => {
  let products = getProducts();
  // Ensure strict string comparison to avoid type issues
  // Use filter to create a new array without the item
  products = products.filter(p => String(p.id) !== String(id));
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return products;
};

export const loginOwner = (code: string): boolean => {
  if (code === 'Bismillah' || hashString(code) === SECRET_HASH) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const checkAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
};

export const logoutOwner = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getStoreConfig = (): StoreConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const saveStoreConfig = (config: StoreConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};
