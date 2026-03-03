export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface Variant {
  _id?: string;
  sku: string;
  color: string;
  colorHex: string;
  storage: string;
  condition: string;
  price: number;
  stock: number;
  images: string[];
}

export interface Product {
  _id: string;
  model: string;
  series: string;
  type: string;
  chip?: string;
  display?: string;
  camera?: string;
  description: string;
  mainImage: string;
  variants: Variant[];
}

export interface CartItem {
  productId: string;
  variantSku: string;
  model: string;
  color: string;
  storage: string;
  condition: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  items: {
    productId: string;
    variantSku: string;
    model: string;
    color: string;
    storage: string;
    condition: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}