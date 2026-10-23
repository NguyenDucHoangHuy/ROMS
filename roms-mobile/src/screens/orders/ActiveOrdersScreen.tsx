import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Bell,
  Clock,
  ArrowRight,
  Utensils,
  Armchair,
  Users,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';
import { tableService, TableData } from '@/services/tableService';

export const ActiveOrdersScreen = () => {
  const navigation = useNavigation<any>();
  const [occupiedTables, setOccupiedTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOccupiedTables = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await tableService.getAll();
      const occupied = (data || []).filter((t) => t.status === 'OCCUPIED');
      setOccupiedTables(occupied);
    } catch (e) {
      console.warn('Lỗi tải danh sách bàn đang phục vụ:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOccupiedTables(true);
    }, [])
  );

  useEffect(() => {
    loadOccupiedTables();
  }, []);

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Utensils size={18} color={theme.colors.primary} />
        </View>
        <Text style={styles.headerBrand}>ROMS WAITER</Text>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate(ROUTES.TABS.NOTIFICATIONS)}
        >
          <Bell size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Screen Title */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Bàn đang phục vụ</Text>
        <Text style={styles.subtitleText}>
          Theo dõi các bàn đang có khách và gọi món trong nhà hàng.
        </Text>
      </View>

      {/* Tables List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách bàn...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadOccupiedTables(true);
              }}
              tintColor={theme.colors.primary}
            />
          }
        >
          {occupiedTables.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Armchair size={48} color={theme.colors.borderDark} />
              <Text style={styles.emptyTitle}>Hiện không có bàn nào đang phục vụ</Text>
              <Text style={styles.emptySub}>
                Tất cả các bàn hiện đang trống hoặc đã hoàn tất thanh toán.
              </Text>
            </View>
          ) : (
            <View style={styles.cardsWrapper}>
              {occupiedTables.map((table) => {
                const session = table.diningSessions?.[0];
                return (
                  <TouchableOpacity
                    key={table.id}
                    style={styles.orderCard}
                    onPress={() =>
                      navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, {
                        tableId: table.id,
                        tableNumber: table.tableNumber,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.tableCircle}>
                        <Text style={styles.tableCircleText}>
                          {table.tableNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.cardTableName}>
                          Bàn {table.tableNumber}
                        </Text>
                        <View style={styles.metaRow}>
                          <Users size={12} color={theme.colors.textMuted} />
                          <Text style={styles.metaText}>
                            {session?.customerCount || 2}/{table.capacity} khách • Tầng{' '}
                            {table.floor}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Đang phục vụ</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.timeWrap}>
                        <Clock size={13} color={theme.colors.textMuted} />
                        <Text style={styles.timeText}>
                          {session?.startTime
                            ? new Date(session.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Mới mở'}
                        </Text>
                      </View>

                      <View style={styles.actionLink}>
                        <Text style={styles.actionLinkText}>Chi tiết gọi món</Text>
                        <ArrowRight size={14} color={theme.colors.primary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  notifBtn: { padding: 4 },

  titleSection: { paddingHorizontal: 20, marginBottom: 16 },
  titleText: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  subtitleText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 13, color: theme.colors.textSecondary },

  scrollArea: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },

  cardsWrapper: { gap: 12 },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.occupied,
    ...theme.shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.occupiedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCircleText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.occupied,
  },
  cardTableName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, color: theme.colors.textMuted },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.occupied,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.occupied,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500' },
  actionLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
