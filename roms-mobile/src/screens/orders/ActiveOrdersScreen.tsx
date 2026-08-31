import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, Clock, ArrowRight, SlidersHorizontal, Utensils } from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';

const ACTIVE_ORDERS = [
  {
    id: 'ord-1',
    tableNumber: '12',
    status: 'READY',
    seatingTime: '45m',
    totalAmount: '850k',
    themeColor: '#D97706',
    borderLeft: theme.colors.primary,
  },
  {
    id: 'ord-2',
    tableNumber: '04',
    status: 'COOKING',
    seatingTime: '22m',
    totalAmount: '1,200k',
    themeColor: '#D97706',
    borderLeft: '#F59E0B',
  },
  {
    id: 'ord-3',
    tableNumber: '08',
    status: 'WAITING',
    seatingTime: '05m',
    totalAmount: '350k',
    themeColor: '#78716C',
    borderLeft: '#CBD5E1',
  },
];

export const ActiveOrdersScreen = () => {
  const navigation = useNavigation<any>();
  const [filterMode, setFilterMode] = useState<'Time' | 'Table'>('Time');

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarCircle} />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>ROMS</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Screen Title */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Active Orders</Text>
        <Text style={styles.subtitleText}>Manage current table orders and kitchen status.</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, filterMode === 'Time' && styles.toggleBtnActive]}
            onPress={() => setFilterMode('Time')}
          >
            <Text style={[styles.toggleText, filterMode === 'Time' && styles.toggleTextActive]}>
              Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filterMode === 'Table' && styles.toggleBtnActive]}
            onPress={() => setFilterMode('Table')}
          >
            <Text style={[styles.toggleText, filterMode === 'Table' && styles.toggleTextActive]}>
              Table
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterIconBtn}>
          <SlidersHorizontal size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Order Cards List */}
      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {ACTIVE_ORDERS.map((order) => (
          <View
            key={order.id}
            style={[styles.orderCard, { borderLeftColor: order.borderLeft }]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.statusLabel, { color: order.themeColor }]}>{order.status}</Text>
              {order.status === 'READY' && (
                <View style={styles.readyBadge}>
                  <Utensils size={10} color="#FFF" />
                  <Text style={styles.readyBadgeText}>READY</Text>
                </View>
              )}
            </View>

            <Text style={styles.tableTitle}>Table #{order.tableNumber}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaCol}>
                <View style={styles.metaLabelWrap}>
                  <Clock size={12} color={theme.colors.textMuted} />
                  <Text style={styles.metaLabel}>Seating Time</Text>
                </View>
                <Text style={styles.metaVal}>{order.seatingTime}</Text>
              </View>

              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Total</Text>
                <Text style={styles.metaVal}>{order.totalAmount}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() =>
                navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, {
                  tableNumber: order.tableNumber,
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ArrowRight size={14} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.border },
  headerBrand: { fontSize: 18, fontWeight: '800', color: theme.colors.text, letterSpacing: 1 },
  notifBtn: { padding: 4 },
  titleSection: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  titleText: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  subtitleText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#ECE5D8',
    borderRadius: 20,
    padding: 3,
    width: 170,
  },
  toggleBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 18 },
  toggleBtnActive: { backgroundColor: theme.colors.primaryDark },
  toggleText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  toggleTextActive: { color: '#FFF' },
  filterIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECE5D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listScroll: { paddingHorizontal: 16, paddingBottom: 90, gap: 12 },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  readyBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  tableTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text, marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
  },
  metaCol: { gap: 2 },
  metaLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 11, color: theme.colors.textMuted },
  metaVal: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  viewDetailsBtn: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewDetailsText: { fontSize: 12, fontWeight: '700', color: theme.colors.primaryDark },
});