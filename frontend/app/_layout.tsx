import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Slot />
      </CartProvider>
    </AuthProvider>
  );
}