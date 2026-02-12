export interface ProductVariant {
  id: string;
  name: string; // e.g., "Size M", "Red", "128GB"
  price: number;
  stock: number;
  image?: string; // Specific image for this variant
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  images?: string[]; // Array of additional image URLs
  variants?: ProductVariant[]; // Array of product variants
  category: string;
  stock: number;
  active: boolean;
  featured: boolean;
  tags?: string[];
  createdAt: number;
}

export interface StoreConfig {
  heroTitle: string; // e.g. "Your Ultimate"
  heroHighlight: string; // e.g. "Shopping Hub"
  heroSubtitle: string;
  heroImages: string[]; // Array of 4 image URLs
  contact: {
    phone: string;
    whatsapp: string; // The number used for API links (e.g., 919846750898)
    email: string;
    instagram: string; // Full URL
    twitter: string;   // Full URL
    address: string;
  };
}

export type SortOption = 'newest' | 'price-low' | 'price-high';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  featured: boolean;
  search: string;
}

export const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Groceries & Food",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Toys & Games",
  "Books & Stationery",
  "Automotive",
  "Sports & Outdoors",
  "Baby Products",
  "Pet Supplies",
  "Garden & Tools",
  "Office Supplies",
  "Arts & Crafts",
  "Musical Instruments",
  "Industrial & Scientific",
  "Jewelry & Watches",
  "Luggage & Bags",
  "Video Games"
];