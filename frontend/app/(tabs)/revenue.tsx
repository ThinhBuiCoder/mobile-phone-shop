import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { orderAPI } from '../../services/api';

export default function Revenue() {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [revenue, setRevenue] = useState({ totalRevenue: 0, orderCount: 0 });

  useEffect(() => {
    loadRevenue();
  }, [period]);

  const loadRevenue = async () => {
    try {
      const date = new Date().toISOString();
      const response = await orderAPI.getRevenue(period, date);
      if (response && response.data) {
        setRevenue(response.data);
      } else {
        setRevenue({ totalRevenue: 0, orderCount: 0 });
      }
    } catch (error) {
      console.error('Load revenue error:', error);
      setRevenue({ totalRevenue: 0, orderCount: 0 });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue Statistics</Text>
      <View style={styles.periodButtons}>
        <TouchableOpacity style={[styles.periodButton, period === 'day' && styles.periodButtonActive]} onPress={() => setPeriod('day')}>
          <Text style={styles.periodButtonText}>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.periodButton, period === 'month' && styles.periodButtonActive]} onPress={() => setPeriod('month')}>
          <Text style={styles.periodButtonText}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.periodButton, period === 'year' && styles.periodButtonActive]} onPress={() => setPeriod('year')}>
          <Text style={styles.periodButtonText}>Year</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Total Revenue</Text>
        <Text style={styles.statsValue}>${revenue.totalRevenue.toLocaleString()}</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Total Orders</Text>
        <Text style={styles.statsValue}>{revenue.orderCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  periodButtons: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  periodButton: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: '#e0e0e0', alignItems: 'center' },
  periodButtonActive: { backgroundColor: '#007AFF' },
  periodButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  statsCard: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginBottom: 15, elevation: 2 },
  statsLabel: { fontSize: 16, color: '#666', marginBottom: 8 },
  statsValue: { fontSize: 32, fontWeight: 'bold', color: '#007AFF' },
});