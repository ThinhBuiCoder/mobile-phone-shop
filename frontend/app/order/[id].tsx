import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { orderAPI } from '../../services/api';
import { Order, OrderItem, OrderStatusHistory } from '../../types';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString();
};

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await orderAPI.getById(id);
      if (response?.data) {
        setOrder(response.data as Order);
      } else {
        setError('Order not found');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const itemCount = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  const renderItem = ({ item }: { item: OrderItem }) => {
    const lineTotal = item.price * item.quantity;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemModel}>{item.model}</Text>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>x{item.quantity}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Spec</Text>
          <Text style={styles.infoValue}>{item.storage} · {item.color} · {item.condition}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>SKU</Text>
          <Text style={styles.infoValue}>{item.variantSku}</Text>
        </View>

        <View style={styles.priceSplitRow}>
          <Text style={styles.unitPrice}>Unit: {formatCurrency(item.price)}</Text>
          <Text style={styles.subtotal}>Subtotal: {formatCurrency(lineTotal)}</Text>
        </View>
      </View>
    );
  };

  const renderStatusItem = ({ item }: { item: OrderStatusHistory }) => (
    <View style={styles.statusItem}>
      <Text style={styles.statusTitle}>{item.status.toUpperCase()}</Text>
      <Text style={styles.statusDate}>{formatDateTime(item.changedAt)}</Text>
      {!!item.note && <Text style={styles.statusNote}>{item.note}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accentBlue} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Order not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.9}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <Text style={styles.title}>Order Detail</Text>

        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Order ID</Text>
          <Text style={styles.metaValue}>{order._id}</Text>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Purchased at</Text>
            <Text style={styles.metaValue}>{formatDateTime(order.orderDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Items</Text>
            <Text style={styles.metaValue}>{itemCount}</Text>
          </View>
        </View>

        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Current status</Text>
          <Text style={styles.metaValue}>{order.status.toUpperCase()}</Text>
        </View>

        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Shipping snapshot</Text>
          <Text style={styles.metaValue}>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</Text>
          <Text style={styles.metaSubValue}>{order.shippingAddress.addressLine}, {order.shippingAddress.city}</Text>
          {!!order.shippingAddress.note && <Text style={styles.metaSubValue}>Note: {order.shippingAddress.note}</Text>}
        </View>

        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Payment</Text>
          <Text style={styles.metaValue}>{order.payment.method.toUpperCase()} · {order.payment.status.toUpperCase()}</Text>
          {!!order.payment.transactionId && <Text style={styles.metaSubValue}>Txn: {order.payment.transactionId}</Text>}
        </View>

        <View style={styles.totalStrip}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Status timeline</Text>
      <FlatList
        data={order.statusHistory}
        keyExtractor={(_, index) => `status-${index}`}
        renderItem={renderStatusItem}
        contentContainerStyle={styles.statusList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Text style={styles.sectionTitle}>Products in this order</Text>
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.variantSku}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  backButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metaCard: {
    backgroundColor: '#F7F9FC',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metaSubValue: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  totalStrip: {
    borderRadius: radius.md,
    backgroundColor: '#EAF2FF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    ...typography.price,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  statusList: {
    paddingBottom: spacing.md,
  },
  statusItem: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  statusTitle: {
    ...typography.body,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  statusDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusNote: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemModel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.md,
  },
  qtyBadge: {
    backgroundColor: '#EAF2FF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  qtyBadgeText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 44,
  },
  infoValue: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  priceSplitRow: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPrice: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subtotal: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.accentBlue,
  },
});
