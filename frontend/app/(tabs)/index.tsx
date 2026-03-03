import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ProductCard from '../../components/ProductCard';
import { productAPI } from '../../services/api';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, [search, sortBy]);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll(search, sortBy);
      setProducts(response.data);
    } catch (error) {
      console.error('Load products error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by model..." 
          value={search} 
          onChangeText={setSearch} 
        />
        <View style={styles.sortButtons}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'asc' && styles.sortButtonActive]} 
            onPress={() => setSortBy(sortBy === 'asc' ? '' : 'asc')}
          >
            <Text style={styles.sortButtonText}>Price ↑</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'desc' && styles.sortButtonActive]} 
            onPress={() => setSortBy(sortBy === 'desc' ? '' : 'desc')}
          >
            <Text style={styles.sortButtonText}>Price ↓</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/product/add')}>
          <Text style={styles.addButtonText}>+ Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ProductCard product={item} />}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 15, elevation: 2 },
  searchInput: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 10 },
  sortButtons: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  sortButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#e0e0e0', alignItems: 'center' },
  sortButtonActive: { backgroundColor: '#007AFF' },
  sortButtonText: { color: '#000', fontWeight: 'bold' },
  addButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#666' },
});