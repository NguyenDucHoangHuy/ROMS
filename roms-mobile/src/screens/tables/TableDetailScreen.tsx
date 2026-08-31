import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Search,
  Users,
  Plus,
  Receipt,
  Utensils,
  Wine,
  Salad,
  CheckCircle2,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';

export type OrderItemStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'REJECTED';

interface OrderItemDetail {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  status: OrderItemStatus;
  timeAgo?: string;
  icon: any;
}

const INITIAL_ORDER_ITEMS: OrderItemDetail[] = [
  {
    id: '1',
    name: 'Black Pepper Beef Steak',
    price: 280000,
    qty: 2,
    note: 'Mild, medium',
    status: 'COOKING',
    timeAgo: '10 mins ago',
    icon: Utensils,
  },
  {
    id: '2',
    name: 'Salmon Salad',
    price: 150000,
    qty: 1,
    note: '',
    status: 'READY',
    timeAgo: 'Just now',
    icon: Salad,
  },
  {
    id: '3',
    name: 'Cocktail Sunset',
    price: 120000,
    qty: 2,
    note: 'Less sugar',
    status: 'SERVED',
    icon: Wine,
  },
  {
    id: '4',
    name: 'Abalone Shark Fin Soup',
    price: 190000,
    qty: 1,
    note: '',
    status: 'PENDING',
    timeAgo: '1 min ago',
    icon: Utensils,
  },
];

export const TableDetailScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const tableNumber = route?.params?.tableNumber || '12';
  const [isClearTable, setIsClearTable] = useState(false);
  const [items, setItems] = useState<OrderItemDetail[]>(INITIAL_ORDER_ITEMS);

  const handleServeItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'SERVED' } : item))
    );
  };

  const getStatusConfig = (status: OrderItemStatus) => {
    return theme.dishStatus[status] || theme.dishStatus.SERVED;
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={theme.colors.text} />
          <Text style={styles.headerTitle}>ROMS</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Search size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>W</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Table Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.tableName}>Table {tableNumber}</Text>
              <View style={styles.guestRow}>
                <Users size={13} color={theme.colors.textSecondary} />
                <Text style={styles.guestText}>4/6 Guests</Text>
              </View>
            </View>

            <View style={styles.topRightCol}>
              <View style={styles.servingBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.servingText}>Serving</Text>
              </View>
              <Text style={styles.durationText}>1h 15m</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryBottomRow}>
            <View>
              <Text style={styles.subtotalLabel}>SUBTOTAL</Text>
              <Text style={styles.subtotalValue}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Clear Table</Text>
              <Switch
                value={isClearTable}
                onValueChange={setIsClearTable}
                trackColor={{ false: '#E7E5E4', true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Order List Header */}
        <Text style={styles.sectionHeader}>Order List ({items.length})</Text>

        {/* Dish Items */}
        <View style={styles.itemsWrapper}>
          {items.map((item) => {
            const badgeCfg = getStatusConfig(item.status);
            const IconComp = item.icon;
            return (
              <View key={item.id} style={styles.dishCard}>
                <View style={styles.dishImageWrap}>
                  <IconComp size={22} color={theme.colors.primary} />
                </View>

                <View style={styles.dishContent}>
                  <View style={styles.dishTitleRow}>
                    <Text style={styles.dishName}>{item.name}</Text>
                    <Text style={styles.dishPrice}>
                      {(item.price * item.qty).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>

                  <Text style={styles.dishSub}>
                    x{item.qty} {item.note ? `• ${item.note}` : ''}
                  </Text>

                  <View style={styles.dishStatusRow}>
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: badgeCfg.bg, borderColor: badgeCfg.border },
                      ]}
                    >
                      <Text style={[styles.statusTagText, { color: badgeCfg.text }]}>
                        {badgeCfg.label}
                      </Text>
                    </View>

                    {item.timeAgo && <Text style={styles.timeAgoText}>{item.timeAgo}</Text>}

                    {item.status === 'READY' && (
                      <TouchableOpacity
                        style={styles.serveBtn}
                        onPress={() => handleServeItem(item.id)}
                        activeOpacity={0.85}
                      >
                        <CheckCircle2 size={13} color="#FFFFFF" />
                        <Text style={styles.serveBtnText}>SERVE</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnAddItem}
          onPress={() => navigation.navigate(ROUTES.STACKS.CREATE_ORDER, { tableNumber })}
          activeOpacity={0.85}
        >
          <Plus size={16} color={theme.colors.primaryDark} />
          <Text style={styles.btnAddText}>Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnPayment} activeOpacity={0.88}>
          <Receipt size={16} color="#FFFFFF" />
          <Text style={styles.btnPaymentText}>Request Payment</Text>
        </TouchableOpacity>
      </View>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE6DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE6DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  scrollArea: { paddingHorizontal: 16, paddingBottom: 110 },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 18,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#1C1917',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 6,
  },
  summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tableName: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  guestText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
  topRightCol: { alignItems: 'flex-end', gap: 4 },
  servingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#15803D' },
  servingText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  durationText: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: 14 },
  summaryBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },
  subtotalValue: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginTop: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  itemsWrapper: { gap: 10 },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  dishImageWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dishContent: { flex: 1 },
  dishTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dishName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  dishPrice: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
  dishSub: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  dishStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  statusTagText: { fontSize: 10, fontWeight: '700' },
  timeAgoText: { fontSize: 10, color: theme.colors.textMuted },
  serveBtn: {
    marginLeft: 'auto',
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  serveBtnText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 22,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  btnAddItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FED2BA',
    gap: 6,
  },
  btnAddText: { fontSize: 13, fontWeight: '700', color: theme.colors.primaryDark },
  btnPayment: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryDark,
    gap: 6,
  },
  btnPaymentText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});