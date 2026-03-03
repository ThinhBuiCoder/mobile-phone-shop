import React, { createContext, useState, useContext } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (variantSku: string, quantity: number) => void;
  removeFromCart: (variantSku: string) => void;
  clearCart: () => void;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantSku === item.variantSku);
      if (existing) {
        return prev.map((i) =>
          i.variantSku === item.variantSku ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (variantSku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantSku);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.variantSku === variantSku ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (variantSku: string) => {
    setCart((prev) => prev.filter((item) => item.variantSku !== variantSku));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};