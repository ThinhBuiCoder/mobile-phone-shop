import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiErrorMessageByStatus, productAPI } from '../../services/api';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { AppToast } from '../../components/ui/AppToast';
import { InputField } from '../../components/ui/InputField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors, radius, spacing, typography } from '../../theme';

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

  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const router = useRouter();

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSubmit = async () => {
    if (!model || !series || !type || !description || !mainImage || !sku || !color || !colorHex || !storage || !price) {
      showErrorToast('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);

      const productData = {
        model,
        series,
        type,
        chip,
        display,
        camera,
        description,
        mainImage,
        variants: [
          {
            sku,
            color,
            colorHex,
            storage,
            condition,
            price: parseFloat(price),
            stock: parseInt(stock, 10) || 0,
            images: [image || mainImage],
          },
        ],
      };

      await productAPI.create(productData);
      setShowSuccessModal(true);
    } catch (error: any) {
      showErrorToast(
        getApiErrorMessageByStatus(
          error,
          { 401: 'Authentication expired. Please sign in again.' },
          'Network error. Failed to add product.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add product</Text>
      <Text style={styles.subtitle}>Create a new iPhone listing with primary variant details</Text>

      <Text style={styles.sectionTitle}>Product information</Text>
      <InputField placeholder="Model (e.g., iPhone 15 Pro Max)*" value={model} onChangeText={setModel} />
      <InputField placeholder="Series (e.g., iPhone 15)*" value={series} onChangeText={setSeries} />
      <InputField placeholder="Type (e.g., Pro Max)*" value={type} onChangeText={setType} />
      <InputField placeholder="Chip (e.g., A17 Pro)" value={chip} onChangeText={setChip} />
      <InputField placeholder="Display (e.g., 6.7-inch Super Retina XDR)" value={display} onChangeText={setDisplay} />
      <InputField placeholder="Camera (e.g., 48MP Main)" value={camera} onChangeText={setCamera} />
      <InputField placeholder="Description*" value={description} onChangeText={setDescription} multiline />
      <InputField placeholder="Main image URL*" value={mainImage} onChangeText={setMainImage} />

      <Text style={styles.sectionTitle}>Primary variant</Text>
      <InputField placeholder="SKU (e.g., IP15PM-256-BTI-NEW)*" value={sku} onChangeText={setSku} />
      <InputField placeholder="Color (e.g., Blue Titanium)*" value={color} onChangeText={setColor} />
      <InputField placeholder="Color hex (e.g., #5F6D7E)*" value={colorHex} onChangeText={setColorHex} />
      <InputField placeholder="Storage (e.g., 256GB)*" value={storage} onChangeText={setStorage} />
      <InputField placeholder="Condition (New/Used 99%/Used 95%)" value={condition} onChangeText={setCondition} />
      <InputField placeholder="Price*" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <InputField placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
      <InputField placeholder="Variant image URL (optional)" value={image} onChangeText={setImage} />

      <PrimaryButton label="Add product" onPress={handleSubmit} loading={saving} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Cancel</Text>
      </TouchableOpacity>

      <SuccessModal
        visible={showSuccessModal}
        title="Product added"
        message="New product has been created successfully."
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      />

      <AppToast
        visible={toastVisible}
        message={toastMessage}
        type="error"
        onHide={() => setToastVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  backButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});