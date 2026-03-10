import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';
import { useRouter } from 'expo-router';
import { colors, radius, shadow, spacing, typography } from '../theme';

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
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.mainImage }} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.info}>
        <Text style={styles.model}>{product.model}</Text>
        <Text style={styles.series}>{product.series} · {product.type}</Text>
        <Text style={styles.variants}>{product.variants.length} variants</Text>
        <Text style={styles.price}>{priceDisplay}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    margin: spacing.sm,
    padding: spacing.md,
    width: '47%',
    ...shadow.card,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  info: {
    gap: spacing.xs,
  },
  model: {
    ...typography.productName,
    color: colors.textPrimary,
  },
  series: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  variants: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  price: {
    ...typography.price,
    color: colors.accentBlue,
    marginTop: spacing.xs,
  },
});