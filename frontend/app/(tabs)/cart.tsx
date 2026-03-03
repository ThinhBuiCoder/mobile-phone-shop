import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { orderAPI } from '../../services/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        variantSku: item.variantSku,
        model: item.model,
        color: item.color,
        storage: item.storage,
        condition: item.condition,
        quantity: item.quantity,
        price: item.price,
      }));
      
      await orderAPI.create({ items, totalAmount });
      clearCart();
      Alert.alert('Success', 'Order placed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.variantSku}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.model}</Text>
              <Text style={styles.itemSpecs}>{item.storage} - {item.color}</Text>
              <Text style={styles.itemCondition}>{item.condition}</Text>
              <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => updateQuantity(item.variantSku, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => updateQuantity(item.variantSku, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => removeFromCart(item.variantSku)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Cart is empty</Text>}
      />
      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Total: ${totalAmount.toLocaleString()}</Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, marginHorizontal: 10, marginTop: 10 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemSpecs: { fontSize: 14, color: '#666', marginBottom: 2 },
  itemCondition: { fontSize: 13, color: '#888', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#007AFF', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantity: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold' },
  removeButton: { justifyContent: 'center' },
  removeButtonText: { fontSize: 30, color: '#dc3545' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#666' },
  footer: { backgroundColor: '#fff', padding: 20, elevation: 5 },
  totalText: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  checkoutButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});