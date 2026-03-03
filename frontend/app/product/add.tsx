import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { productAPI } from '../../services/api';

export default function AddProduct() {
  const [model, setModel] = useState('');
  const [series, setSeries] = useState('');
  const [type, setType] = useState('');
  const [chip, setChip] = useState('');
  const [display, setDisplay] = useState('');
  const [camera, setCamera] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  
  const [sku, setSku] = useState('');
  const [color, setColor] = useState('');
  const [colorHex, setColorHex] = useState('');
  const [storage, setStorage] = useState('');
  const [condition, setCondition] = useState('New');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  
  const router = useRouter();

  const handleSubmit = async () => {
    if (!model || !series || !type || !description || !mainImage || !sku || !color || !colorHex || !storage || !price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const productData = {
        model,
        series,
        type,
        chip,
        display,
        camera,
        description,
        mainImage,
        variants: [{
          sku,
          color,
          colorHex,
          storage,
          condition,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          images: [image || mainImage]
        }]
      };

      await productAPI.create(productData);
      Alert.alert('Success', 'Product added', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Product</Text>
      
      <Text style={styles.sectionTitle}>Product Information</Text>
      <TextInput style={styles.input} placeholder="Model (e.g., iPhone 15 Pro Max)*" value={model} onChangeText={setModel} />
      <TextInput style={styles.input} placeholder="Series (e.g., iPhone 15)*" value={series} onChangeText={setSeries} />
      <TextInput style={styles.input} placeholder="Type (e.g., Pro Max)*" value={type} onChangeText={setType} />
      <TextInput style={styles.input} placeholder="Chip (e.g., A17 Pro)" value={chip} onChangeText={setChip} />
      <TextInput style={styles.input} placeholder="Display (e.g., 6.7-inch Super Retina XDR)" value={display} onChangeText={setDisplay} />
      <TextInput style={styles.input} placeholder="Camera (e.g., 48MP Main)" value={camera} onChangeText={setCamera} />
      <TextInput style={styles.input} placeholder="Description*" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      <TextInput style={styles.input} placeholder="Main Image URL*" value={mainImage} onChangeText={setMainImage} />
      
      <Text style={styles.sectionTitle}>Variant Information</Text>
      <TextInput style={styles.input} placeholder="SKU (e.g., IP15PM-256-BTI-NEW)*" value={sku} onChangeText={setSku} />
      <TextInput style={styles.input} placeholder="Color (e.g., Blue Titanium)*" value={color} onChangeText={setColor} />
      <TextInput style={styles.input} placeholder="Color Hex (e.g., #5F6D7E)*" value={colorHex} onChangeText={setColorHex} />
      <TextInput style={styles.input} placeholder="Storage (e.g., 256GB)*" value={storage} onChangeText={setStorage} />
      <TextInput style={styles.input} placeholder="Condition (New/Used 99%/Used 95%)" value={condition} onChangeText={setCondition} />
      <TextInput style={styles.input} placeholder="Price*" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Variant Image URL (optional)" value={image} onChangeText={setImage} />
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#007AFF' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#dc3545', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  cancelButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});