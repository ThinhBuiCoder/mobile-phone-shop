import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getApiErrorMessageByStatus, productAPI } from '../../services/api';
import { Product, Variant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  const navigateBack = () => {
    router.replace('/(tabs)');
  };

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const response = await productAPI.getById(id as string);
      setProduct(response.data);
      if (response.data.variants.length > 0) {
        const firstVariant = response.data.variants[0];
        setSelectedVariant(firstVariant);
        setSelectedColor(firstVariant.color);
        setSelectedStorage(firstVariant.storage);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load product');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    updateSelectedVariant(color, selectedStorage);
  };

  const handleStorageSelect = (storage: string) => {
    setSelectedStorage(storage);
    updateSelectedVariant(selectedColor, storage);
  };

  const updateSelectedVariant = (color: string, storage: string) => {
    if (!product) return;
    const variant = product.variants.find(
      v => v.color === color && v.storage === storage
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    addToCart({
      productId: product._id,
      variantSku: selectedVariant.sku,
      model: product.model,
      color: selectedVariant.color,
      storage: selectedVariant.storage,
      condition: selectedVariant.condition,
      price: selectedVariant.price,
      image: selectedVariant.images[0] || product.mainImage,
    });
    
    Alert.alert('Success', 'Added to cart');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleEdit = () => {
    router.push(`/product/edit/${id}`);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await productAPI.delete(id as string);
      setShowDeleteModal(false);
      Alert.alert('Success', 'Product deleted');
      navigateBack();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setShowDeleteModal(false);
        Alert.alert('Login session has expired.');
        router.replace('/(auth)/login');
        return;
      }

      Alert.alert(
        'Error',
        getApiErrorMessageByStatus(error, {}, 'Failed to delete product')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!product || !selectedVariant) return <Text style={styles.loading}>Loading...</Text>;

  const availableColors = [...new Set(product.variants.map(v => v.color))];
  const availableStorages = [...new Set(
    product.variants.filter(v => v.color === selectedColor).map(v => v.storage)
  )];

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: selectedVariant.images[0] || product.mainImage }}
        style={styles.image}
        resizeMode="contain"
      />
      
      <View style={styles.infoSection}>
        <Text style={styles.model}>{product.model}</Text>
        <Text style={styles.series}>{product.series} - {product.type}</Text>
        {product.chip && <Text style={styles.spec}>Chip: {product.chip}</Text>}
        {product.display && <Text style={styles.spec}>Display: {product.display}</Text>}
        {product.camera && <Text style={styles.spec}>Camera: {product.camera}</Text>}
        <Text style={styles.description}>{product.description}</Text>
      </View>

      <View style={styles.variantSection}>
        <Text style={styles.sectionTitle}>Select Color</Text>
        <View style={styles.colorContainer}>
          {availableColors.map((color) => {
            const variant = product.variants.find(v => v.color === color);
            return (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  selectedColor === color && styles.colorOptionSelected
                ]}
                onPress={() => handleColorSelect(color)}
              >
                <View 
                  style={[
                    styles.colorCircle, 
                    { backgroundColor: variant?.colorHex || '#ccc' }
                  ]} 
                />
                <Text style={styles.colorText}>{color}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Select Storage</Text>
        <View style={styles.storageContainer}>
          {availableStorages.map((storage) => (
            <TouchableOpacity
              key={storage}
              style={[
                styles.storageOption,
                selectedStorage === storage && styles.storageOptionSelected
              ]}
              onPress={() => handleStorageSelect(storage)}
            >
              <Text style={styles.storageText}>{storage}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.condition}>{selectedVariant.condition}</Text>
          <Text style={styles.price}>${selectedVariant.price.toLocaleString()}</Text>
          <Text style={styles.stock}>Stock: {selectedVariant.stock}</Text>
          <Text style={styles.sku}>SKU: {selectedVariant.sku}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.addButton, selectedVariant.stock === 0 && styles.addButtonDisabled]} 
        onPress={handleAddToCart}
        disabled={selectedVariant.stock === 0}
      >
        <Text style={styles.addButtonText}>
          {selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Edit Product</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Product</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
        <Text style={styles.backButtonText}>Back to List</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete product?"
        message="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        loading={isDeleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { textAlign: 'center', marginTop: 50, fontSize: 18 },
  image: { width: '100%', height: 350, resizeMode: 'contain', backgroundColor: '#fff' },
  infoSection: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
  model: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  series: { fontSize: 18, color: '#666', marginBottom: 12 },
  spec: { fontSize: 14, color: '#888', marginBottom: 4 },
  description: { fontSize: 16, lineHeight: 24, marginTop: 12, color: '#333' },
  variantSection: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  colorContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  colorOption: { alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 2, borderColor: '#e0e0e0', minWidth: 80 },
  colorOptionSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
  colorCircle: { width: 30, height: 30, borderRadius: 15, marginBottom: 5, borderWidth: 1, borderColor: '#ddd' },
  colorText: { fontSize: 12, textAlign: 'center' },
  storageContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  storageOption: { padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#e0e0e0', minWidth: 80, alignItems: 'center' },
  storageOptionSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
  storageText: { fontSize: 14, fontWeight: 'bold' },
  priceSection: { marginTop: 10, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8 },
  condition: { fontSize: 14, color: '#666', marginBottom: 8 },
  price: { fontSize: 32, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 },
  stock: { fontSize: 14, color: '#28a745', marginBottom: 4 },
  sku: { fontSize: 12, color: '#888' },
  addButton: { backgroundColor: '#007AFF', padding: 18, margin: 20, borderRadius: 8, alignItems: 'center' },
  addButtonDisabled: { backgroundColor: '#ccc' },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  editButton: { backgroundColor: '#17a2b8', padding: 15, marginHorizontal: 20, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#dc3545', padding: 15, marginHorizontal: 20, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { backgroundColor: '#6c757d', padding: 15, marginHorizontal: 20, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});