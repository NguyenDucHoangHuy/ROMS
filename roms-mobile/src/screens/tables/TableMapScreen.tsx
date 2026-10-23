import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Bell,
  QrCode,
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  Armchair,
  Sparkles,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';
import { tableService, TableData } from '@/services/tableService';
import { getSocketClient, connectSocketClient } from '@/services/socket';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

export const TableMapScreen = () => {
  const navigation = useNavigation<any>();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState('Tất cả');

  // Tải danh sách bàn từ DB
  const loadTables = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await tableService.getAll();
      setTables(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Lỗi tải danh sách bàn:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động tải lại khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadTables(true);
    }, [])
  );

  // Kết nối socket để tự động cập nhật thời gian thực khi trạng thái bàn thay đổi
  useEffect(() => {
    loadTables();
    connectSocketClient();
    const socket = getSocketClient();

    const handleUpdate = () => {
      loadTables(true);
    };

    socket.on('order:item-updated', handleUpdate);
    socket.on('table:updated', handleUpdate);

    return () => {
      socket.off('order:item-updated', handleUpdate);
      socket.off('table:updated', handleUpdate);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTables(true);
  };

  // Danh sách các tầng từ database
  const floorList = Array.from(new Set(tables.map((t) => t.floor || 1))).sort();
  const zones = ['Tất cả', ...floorList.map((f) => `Tầng ${f}`)];

  // Lọc bàn theo khu vực/tầng đã chọn
  const filteredTables = tables.filter((table) => {
    if (selectedZone === 'Tất cả') return true;
    return `Tầng ${table.floor || 1}` === selectedZone;
  });

  // Xử lý khi nhấn vào bàn
  const handleTablePress = (table: TableData) => {
    if (table.status === 'OCCUPIED') {
      navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, {
        tableId: table.id,
        tableNumber: table.tableNumber,
      });
    } else if (table.status === 'AVAILABLE') {
      Alert.alert(
        `Bàn ${table.tableNumber}`,
        `Bàn đang trống (${table.capacity} chỗ). Bạn muốn làm gì?`,
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Gọi món cho bàn này',
            onPress: () =>
              navigation.navigate(ROUTES.STACKS.CREATE_ORDER, {
                tableId: table.id,
                tableNumber: table.tableNumber,
              }),
          },
        ]
      );
    } else if (table.status === 'RESERVED') {
      const res = table.reservations?.[0];
      Alert.alert(
        `Bàn ${table.tableNumber} (Đã đặt trước)`,
        `Khách: ${res?.guestName || 'Khách đặt trước'}\nSĐT: ${
          res?.guestPhone || '---'
        }\nSố khách: ${res?.partySize || table.capacity} người`,
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Quét QR Check-in',
            onPress: () => navigation.navigate(ROUTES.STACKS.SCAN_CHECK_IN),
          },
        ]
      );
    } else if (table.status === 'CLEANING') {
      Alert.alert(
        `Bàn ${table.tableNumber}`,
        'Bàn đang trong trạng thái dọn dẹp. Chuyển sang bàn trống sẵn sàng đón khách?',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Xác nhận Bàn trống',
            onPress: async () => {
              try {
                await tableService.updateStatus(table.id, 'AVAILABLE');
                loadTables(true);
              } catch (e) {
                Alert.alert('Lỗi', 'Không thể cập nhật trạng thái bàn.');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => navigation.navigate(ROUTES.TABS.PROFILE)}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImg}
          />
          <Text style={styles.brandTitle}>ROMS</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.qrScanBtn}
            onPress={() => navigation.navigate(ROUTES.STACKS.SCAN_CHECK_IN)}
            activeOpacity={0.8}
          >
            <QrCode size={16} color={theme.colors.textOnPrimary} />
            <Text style={styles.qrScanBtnText}>Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate(ROUTES.TABS.NOTIFICATIONS)}
          >
            <Bell size={22} color={theme.colors.primary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone Tabs */}
      <View style={styles.zoneWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zoneScroll}
        >
          {zones.map((zone) => {
            const active = selectedZone === zone;
            return (
              <TouchableOpacity
                key={zone}
                style={[styles.zonePill, active && styles.zonePillActive]}
                onPress={() => setSelectedZone(zone)}
                activeOpacity={0.8}
              >
                <Text style={[styles.zoneText, active && styles.zoneTextActive]}>
                  {zone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Table Grid */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải sơ đồ bàn...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.gridScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {filteredTables.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Armchair size={48} color={theme.colors.borderDark} />
              <Text style={styles.emptyText}>Chưa có bàn nào trong khu vực này.</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredTables.map((table) => {
                const isOccupied = table.status === 'OCCUPIED';
                const isAvailable = table.status === 'AVAILABLE';
                const isReserved = table.status === 'RESERVED';
                const isCleaning = table.status === 'CLEANING';

                const reservation = table.reservations?.[0];
                const activeSession = table.diningSessions?.[0];

                return (
                  <TouchableOpacity
                    key={table.id}
                    style={[
                      styles.tableCard,
                      isOccupied && styles.cardOccupied,
                      isAvailable && styles.cardAvailable,
                      isReserved && styles.cardReserved,
                      isCleaning && styles.cardCleaning,
                    ]}
                    onPress={() => handleTablePress(table)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View
                        style={[
                          styles.circleNumber,
                          isOccupied && styles.circleNumberOccupied,
                          isAvailable && styles.circleNumberAvailable,
                          isReserved && styles.circleNumberReserved,
                          isCleaning && styles.circleNumberCleaning,
                        ]}
                      >
                        <Text
                          style={[
                            styles.circleNumberText,
                            isOccupied && styles.circleNumberTextWhite,
                            isAvailable && styles.circleNumberTextGreen,
                            isReserved && styles.circleNumberTextBlue,
                            isCleaning && styles.circleNumberTextGray,
                          ]}
                        >
                          {table.tableNumber}
                        </Text>
                      </View>

                      {/* Status Badge */}
                      {isOccupied && (
                        <View style={styles.badgeOccupied}>
                          <View style={styles.dotOrange} />
                          <Text style={styles.badgeOccupiedText}>Có khách</Text>
                        </View>
                      )}
                      {isAvailable && (
                        <View style={styles.badgeAvailable}>
                          <Text style={styles.badgeAvailableText}>Trống</Text>
                        </View>
                      )}
                      {isReserved && (
                        <View style={styles.badgeReserved}>
                          <Text style={styles.badgeReservedText}>Đã đặt</Text>
                        </View>
                      )}
                      {isCleaning && (
                        <View style={styles.badgeCleaning}>
                          <Sparkles size={11} color={theme.colors.textSecondary} />
                          <Text style={styles.badgeCleaningText}>Dọn dẹp</Text>
                        </View>
                      )}
                    </View>

                    {/* Party name if reserved */}
                    {isReserved && reservation ? (
                      <Text style={styles.reservedPartyName} numberOfLines={1}>
                        {reservation.guestName}
                      </Text>
                    ) : null}

                    {/* Bottom Row Info */}
                    <View style={styles.cardBottomRow}>
                      <View style={styles.infoItem}>
                        <Users size={13} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>
                          {isOccupied && activeSession
                            ? `${activeSession.customerCount || 1}/${table.capacity}`
                            : `${table.capacity} chỗ`}
                        </Text>
                      </View>

                      <View style={styles.infoItem}>
                        {isReserved ? (
                          <>
                            <Calendar size={13} color={theme.colors.reserved} />
                            <Text
                              style={[
                                styles.infoText,
                                { color: theme.colors.reserved, fontWeight: '700' },
                              ]}
                            >
                              {reservation?.reservationTime
                                ? new Date(reservation.reservationTime).toLocaleTimeString(
                                    [],
                                    { hour: '2-digit', minute: '2-digit' }
                                  )
                                : 'Hôm nay'}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Armchair size={13} color={theme.colors.textMuted} />
                            <Text style={styles.infoText}>Tầng {table.floor}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Action Button (Thêm đơn gọi món nhanh) */}
      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => navigation.navigate(ROUTES.STACKS.SCAN_CHECK_IN)}
        activeOpacity={0.9}
      >
        <QrCode size={26} color={theme.colors.textOnPrimary} strokeWidth={2.2} />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qrScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    ...theme.shadow.sm,
  },
  qrScanBtnText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.textOnPrimary,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  brandTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.primary,
    letterSpacing: 1.2,
  },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },

  zoneWrapper: { marginVertical: 4 },
  zoneScroll: { paddingHorizontal: theme.spacing.md, gap: 10 },
  zonePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceAlt,
  },
  zonePillActive: { backgroundColor: theme.colors.primary },
  zoneText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
  },
  zoneTextActive: { color: theme.colors.textOnPrimary },

  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },

  gridScroll: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 12,
    paddingBottom: 90,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tableCard: {
    width: CARD_WIDTH,
    minHeight: 140,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  cardOccupied: {
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.occupied,
    backgroundColor: theme.colors.occupiedBg,
  },
  cardAvailable: {
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.available,
  },
  cardReserved: {
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.reserved,
    backgroundColor: theme.colors.reservedBg,
  },
  cardCleaning: { backgroundColor: theme.colors.cleaningBg },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumberOccupied: { backgroundColor: theme.colors.occupied },
  circleNumberAvailable: { backgroundColor: theme.colors.availableBg },
  circleNumberReserved: { backgroundColor: theme.colors.surface },
  circleNumberCleaning: { backgroundColor: theme.colors.surface },

  circleNumberText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
  },
  circleNumberTextWhite: { color: theme.colors.textOnPrimary },
  circleNumberTextGreen: { color: theme.colors.available },
  circleNumberTextBlue: { color: theme.colors.reserved },
  circleNumberTextGray: { color: theme.colors.textSecondary },

  badgeOccupied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  dotOrange: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.occupied,
  },
  badgeOccupiedText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.occupied,
  },

  badgeAvailable: {
    backgroundColor: theme.colors.availableBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeAvailableText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.available,
  },

  badgeReserved: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeReservedText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.reserved,
  },

  badgeCleaning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeCleaningText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
  },

  reservedPartyName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 2,
  },

  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },

  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.md,
  },
});
