import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { orderAPI } from '../../services/api';
import { RevenueResponse, Order } from '../../types';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString();
};

export default function Revenue() {
  const router = useRouter();
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [revenue, setRevenue] = useState<RevenueResponse>({
    totalRevenue: 0,
    orderCount: 0,
    orders: [],
  });

  useEffect(() => {
    loadRevenue();
  }, [period]);

  const loadRevenue = async () => {
    try {
      const date = new Date().toISOString();
      const [revenueResponse, myOrdersResponse] = await Promise.all([
        orderAPI.getRevenue(period, date),
        orderAPI.getMyOrders(),
      ]);

      const myOrders = Array.isArray(myOrdersResponse?.data) ? myOrdersResponse.data : [];
      const revenueData = revenueResponse?.data as Partial<RevenueResponse> | null;

      if (revenueData) {
        setRevenue({
          totalRevenue: revenueData.totalRevenue ?? 0,
          orderCount: revenueData.orderCount ?? 0,
          orders: myOrders,
        });
      } else {
        setRevenue({ totalRevenue: 0, orderCount: 0, orders: myOrders });
      }
    } catch (error) {
      console.error('Load revenue error:', error);
      setRevenue({ totalRevenue: 0, orderCount: 0, orders: [] });
    }
  };

  const handleOpenOrder = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.orderCard}
      onPress={() => handleOpenOrder(item._id)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{formatDateTime(item.orderDate)}</Text>
        <Text style={styles.orderTotal}>{formatCurrency(item.totalAmount)}</Text>
      </View>
      <Text style={styles.orderMeta}>{item.items.length} item(s) · {item.status.toUpperCase()}</Text>
      <Text style={styles.orderAction}>Tap to view details</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Revenue</Text>
        <Text style={styles.subtitle}>Order history with shipping snapshot, payment and status timeline</Text>
      </View>

      <View style={styles.segmentWrapper}>
        <SegmentedControl
          options={[
            { value: 'day' as const, label: 'Day' },
            { value: 'month' as const, label: 'Month' },
            { value: 'year' as const, label: 'Year' },
          ]}
          value={period}
          onChange={setPeriod}
        />
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Total revenue</Text>
          <Text style={styles.statsValue}>{formatCurrency(revenue.totalRevenue)}</Text>
          <Text style={styles.statsMeta}>Computed from paid and pending checkout records</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Orders in period</Text>
          <Text style={styles.statsValue}>{revenue.orderCount}</Text>
          <Text style={styles.statsMeta}>Number of orders in selected period</Text>
        </View>
      </View>

      <Text style={styles.historyTitle}>My purchase history</Text>
      <FlatList
        data={revenue.orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={revenue.orders.length === 0 ? styles.emptyList : styles.historyList}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  segmentWrapper: {
    marginBottom: spacing.lg,
  },
  cardsRow: {
    marginBottom: spacing.lg,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  statsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accentBlue,
    marginBottom: spacing.sm,
  },
  statsMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  historyList: {
    paddingBottom: spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  orderDate: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  orderTotal: {
    ...typography.price,
    color: colors.accentBlue,
  },
  orderMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  orderAction: {
    ...typography.caption,
    color: colors.accentBlue,
    marginTop: spacing.xs,
  },
});
