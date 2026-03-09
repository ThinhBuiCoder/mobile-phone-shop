import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, TextInput } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { orderAPI } from '../../services/api';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { AppToast } from '../../components/ui/AppToast';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'card'>('cod');

  const canCheckout = useMemo(() => {
    return !!fullName.trim() && !!phone.trim() && !!addressLine.trim() && !!city.trim();
  }, [fullName, phone, addressLine, city]);

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    if (!canCheckout) {
      showErrorToast('Please fill in full shipping information.');
      return;
    }

    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
      }));

      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      await orderAPI.create({
        items,
        idempotencyKey,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          city: city.trim(),
          note: note.trim(),
        },
        payment: {
          method: paymentMethod,
        },
      });

      clearCart();
      setShowSuccessModal(true);
      setNote('');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        showErrorToast('Authentication expired. Please sign in again.');
      } else if (status === 409) {
        showErrorToast(error?.response?.data?.message || 'Some products are out of stock.');
      } else {
        showErrorToast(error?.response?.data?.message || 'Network error. Checkout failed.');
      }
    }
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.variantSku}
        contentContainerStyle={cart.length === 0 ? styles.emptyList : styles.list}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.model}</Text>
              <Text style={styles.itemSpecs}>{item.storage} · {item.color}</Text>
              <Text style={styles.itemCondition}>{item.condition}</Text>
              <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityPill}
                  onPress={() => updateQuantity(item.variantSku, item.quantity - 1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quantityPillText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityPill}
                  onPress={() => updateQuantity(item.variantSku, item.quantity + 1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quantityPillText}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(item.variantSku)}
              activeOpacity={0.8}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add your favorite iPhones to see them here.
            </Text>
          </View>
        }
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryCard}>
            <Text style={styles.formTitle}>Shipping information</Text>
            <TextInput style={styles.input} placeholder="Full name" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Address line" value={addressLine} onChangeText={setAddressLine} />
            <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
            <TextInput style={styles.input} placeholder="Note (optional)" value={note} onChangeText={setNote} />

            <Text style={styles.formTitle}>Payment method</Text>
            <View style={styles.paymentRow}>
              {[
                { label: 'COD', value: 'cod' },
                { label: 'Bank', value: 'bank_transfer' },
                { label: 'Card', value: 'card' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.paymentChip, paymentMethod === item.value && styles.paymentChipActive]}
                  onPress={() => setPaymentMethod(item.value as 'cod' | 'bank_transfer' | 'card')}
                >
                  <Text style={[styles.paymentChipText, paymentMethod === item.value && styles.paymentChipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryMuted}>Calculated at checkout</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>${totalAmount.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, !canCheckout && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            activeOpacity={0.9}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      <SuccessModal
        visible={showSuccessModal}
        title="Checkout success"
        message="Your order has been created successfully."
        onClose={() => setShowSuccessModal(false)}
      />

      <AppToast
        visible={toastVisible}
        message={toastMessage}
        type="error"
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.productName,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemSpecs: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  itemCondition: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.price,
    color: colors.accentBlue,
    marginBottom: spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityPill: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  quantityPillText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  quantity: {
    marginHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  removeButton: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  formTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  paymentChipActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  paymentChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  paymentChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  summaryMuted: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    ...typography.price,
    color: colors.textPrimary,
  },
  summaryTotalValue: {
    ...typography.price,
    color: colors.accentBlue,
  },
  checkoutButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    ...typography.price,
    color: '#FFF',
  },
});
