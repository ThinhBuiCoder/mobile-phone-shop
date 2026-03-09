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

export interface OrderItem {
  productId: string;
  variantSku: string;
  model: string;
  color: string;
  storage: string;
  condition: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  note?: string;
}

export interface PaymentInfo {
  method: 'cod' | 'bank_transfer' | 'card';
  status: 'pending' | 'paid' | 'failed';
  transactionId?: string;
}

export interface OrderStatusHistory {
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  changedAt: string;
  note?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
  statusHistory: OrderStatusHistory[];
}

export interface RevenueResponse {
  totalRevenue: number;
  orderCount: number;
  orders: Order[];
}
