import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getApiErrorMessageByStatus, productAPI } from '../../../services/api';
import { Product } from '../../../types';
import { colors, radius, spacing, typography } from '../../../theme';
import { InputField } from '../../../components/ui/InputField';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SuccessModal } from '../../../components/ui/SuccessModal';
import { AppToast } from '../../../components/ui/AppToast';

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

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
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const loadProduct = async () => {
    try {
      const response = await productAPI.getById(id as string);
      const p = response?.data as Product | null;
      if (!p) {
        throw new Error('Product not found');
      }
      setProduct(p);

      setModel(p.model);
      setSeries(p.series);
      setType(p.type);
      setChip(p.chip || '');
      setDisplay(p.display || '');
      setCamera(p.camera || '');
      setDescription(p.description);
      setMainImage(p.mainImage);

      const firstVariant = p.variants[0];
      if (firstVariant) {
        setSku(firstVariant.sku);
        setColor(firstVariant.color);
        setColorHex(firstVariant.colorHex);
        setStorage(firstVariant.storage);
        setCondition(firstVariant.condition);
        setPrice(String(firstVariant.price));
        setStock(String(firstVariant.stock));
      }
    } catch (error) {
      showErrorToast('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;

    if (!model || !series || !type || !description || !mainImage || !sku || !color || !colorHex || !storage || !price) {
      showErrorToast('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);

      const updated = {
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
            condition: condition || 'New',
            price: parseFloat(price),
            stock: parseInt(stock || '0', 10),
            images: product.variants[0]?.images ?? [mainImage],
          },
        ],
      };

      await productAPI.update(product._id, updated);
      setShowSuccessModal(true);
    } catch (error: any) {
      showErrorToast(
        getApiErrorMessageByStatus(
          error,
          { 401: 'Authentication expired. Please sign in again.' },
          'Network error. Failed to update product.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit product</Text>
      <Text style={styles.subtitle}>Update key details for this iPhone</Text>

      <Text style={styles.sectionTitle}>Product information</Text>
      <InputField placeholder="Model*" value={model} onChangeText={setModel} />
      <InputField placeholder="Series*" value={series} onChangeText={setSeries} />
      <InputField placeholder="Type*" value={type} onChangeText={setType} />
      <InputField placeholder="Chip" value={chip} onChangeText={setChip} />
      <InputField placeholder="Display" value={display} onChangeText={setDisplay} />
      <InputField placeholder="Camera" value={camera} onChangeText={setCamera} />
      <InputField placeholder="Description*" value={description} onChangeText={setDescription} multiline />
      <InputField placeholder="Main image URL*" value={mainImage} onChangeText={setMainImage} />

      <Text style={styles.sectionTitle}>Primary variant</Text>
      <InputField placeholder="SKU*" value={sku} onChangeText={setSku} />
      <InputField placeholder="Color*" value={color} onChangeText={setColor} />
      <InputField placeholder="Color hex*" value={colorHex} onChangeText={setColorHex} />
      <InputField placeholder="Storage*" value={storage} onChangeText={setStorage} />
      <InputField placeholder="Condition" value={condition} onChangeText={setCondition} />
      <InputField placeholder="Price*" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <InputField placeholder="Stock" keyboardType="numeric" value={stock} onChangeText={setStock} />

      <PrimaryButton label="Save changes" onPress={handleSave} loading={saving} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Product Detail</Text>
      </TouchableOpacity>

      <SuccessModal
        visible={showSuccessModal}
        title="Product updated"
        message="Product information has been saved successfully."
        onClose={() => {
          setShowSuccessModal(false);
          router.replace(`/product/${product._id}`);
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
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
