import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';
import { useRouter } from 'expo-router';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));
  const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <Image source={{ uri: product.mainImage }} style={styles.image} />
      <Text style={styles.model}>{product.model}</Text>
      <Text style={styles.series}>{product.series} - {product.type}</Text>
      <Text style={styles.variants}>{product.variants.length} variants</Text>
      <Text style={styles.price}>{priceDisplay}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, margin: 8, elevation: 2, width: '45%' },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  model: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  series: { fontSize: 13, color: '#666', marginBottom: 2 },
  variants: { fontSize: 12, color: '#888', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
});