import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  Users,
  Plus,
  Receipt,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';
import {
  orderService,
  ActiveOrderData,
  OrderItemData,
  OrderItemStatus,
} from '@/services/orderService';
import { tableService } from '@/services/tableService';
import { getSocketClient } from '@/services/socket';

export const TableDetailScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const tableId = route?.params?.tableId;
  const tableNumber = route?.params?.tableNumber || '---';

  const [order, setOrder] = useState<ActiveOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [servingItemId, setServingItemId] = useState<string | null>(null);

  // Tải thông tin đơn hàng đang phục vụ của bàn
  const loadActiveOrder = async (isSilent = false) => {
    if (!tableId) return;
    if (!isSilent) setLoading(true);
    try {
      const data = await orderService.getActiveByTable(tableId);
      setOrder(data);
    } catch (err: any) {
      console.warn('Lỗi tải đơn bàn:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadActiveOrder(true);
    }, [tableId])
  );

  // Lắng nghe socket khi bếp cập nhật trạng thái món
  useEffect(() => {
    loadActiveOrder();
    const socket = getSocketClient();

    const handleUpdate = (payload: any) => {
      if (!payload?.tableId || payload.tableId === tableId) {
        loadActiveOrder(true);
      }
    };

    socket.on('order:item-updated', handleUpdate);
    return () => {
      socket.off('order:item-updated', handleUpdate);
    };
  }, [tableId]);

  // Phục vụ món ăn khi bếp đã nấu xong (READY -> SERVED)
  const handleServeItem = async (itemId: string) => {
    if (!order) return;
    setServingItemId(itemId);
    try {
      await orderService.updateItemStatus(order.id, itemId, 'SERVED');
      // Cập nhật optimistic UI
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orderItems: prev.orderItems.map((item) =>
            item.id === itemId ? { ...item, itemStatus: 'SERVED' } : item
          ),
        };
      });
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái món phục vụ.');
    } finally {
      setServingItemId(null);
    }
  };

  // Hoàn tất và dọn bàn
  const handleClearTable = () => {
    Alert.alert(
      'Dọn bàn & Trả bàn trống',
      `Xác nhận khách đã rời Bàn ${tableNumber} và hoàn tất dọn bàn?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xác nhận Dọn bàn',
          style: 'destructive',
          onPress: async () => {
            if (!tableId) return;
            try {
              await tableService.updateStatus(tableId, 'AVAILABLE');
              Alert.alert('Thành công', `Bàn ${tableNumber} đã sẵn sàng đón khách mới!`, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e) {
              Alert.alert('Lỗi', 'Không thể giải phóng bàn.');
            }
          },
        },
      ]
    );
  };

  const getStatusConfig = (status: OrderItemStatus) => {
    return theme.dishStatus[status] || theme.dishStatus.SERVED;
  };

  const items = order?.orderItems || [];
  const totalAmount =
    order?.totalAmount ||
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
          <Text style={styles.headerTitle}>Chi tiết Bàn {tableNumber}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearTableTopBtn}
          onPress={handleClearTable}
          activeOpacity={0.7}
        >
          <Sparkles size={16} color={theme.colors.textSecondary} />
          <Text style={styles.clearTableTopText}>Dọn bàn</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết bàn...</Text>
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
                loadActiveOrder(true);
              }}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Table Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.tableName}>Bàn {tableNumber}</Text>
                <View style={styles.guestRow}>
                  <Users size={13} color={theme.colors.textSecondary} />
                  <Text style={styles.guestText}>
                    {order?.session?.customerCount || 2} khách • Tầng{' '}
                    {order?.session?.table?.floor || 1}
                  </Text>
                </View>
              </View>

              <View style={styles.topRightCol}>
                <View style={styles.servingBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.servingText}>Đang phục vụ</Text>
                </View>
                <Text style={styles.durationText}>
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Mới mở'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryBottomRow}>
              <View>
                <Text style={styles.subtotalLabel}>TỔNG TIỀN MÓN</Text>
                <Text style={styles.subtotalValue}>
                  {totalAmount.toLocaleString('vi-VN')} đ
                </Text>
              </View>
              <TouchableOpacity
                style={styles.quickAddBtn}
                onPress={() =>
                  navigation.navigate(ROUTES.STACKS.CREATE_ORDER, {
                    tableId,
                    tableNumber,
                    existingOrderId: order?.id,
                  })
                }
              >
                <Plus size={15} color={theme.colors.primary} />
                <Text style={styles.quickAddText}>Gọi thêm món</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order List Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Danh sách món ({items.length})</Text>
            {items.some((i) => i.itemStatus === 'READY') && (
              <View style={styles.readyAlertPill}>
                <Clock size={12} color="#15803D" />
                <Text style={styles.readyAlertText}>Có món chờ bưng ra!</Text>
              </View>
            )}
          </View>

          {/* Dish Items */}
          {items.length === 0 ? (
            <View style={styles.emptyOrderCard}>
              <Utensils size={36} color={theme.colors.borderDark} />
              <Text style={styles.emptyOrderTitle}>Bàn này chưa gọi món</Text>
              <Text style={styles.emptyOrderSub}>
                Khách vừa nhận bàn. Hãy nhấn nút bên dưới để chọn món phục vụ khách.
              </Text>
              <TouchableOpacity
                style={styles.startOrderBtn}
                onPress={() =>
                  navigation.navigate(ROUTES.STACKS.CREATE_ORDER, {
                    tableId,
                    tableNumber,
                  })
                }
                activeOpacity={0.85}
              >
                <Plus size={18} color="#FFF" />
                <Text style={styles.startOrderBtnText}>Tạo đơn gọi món</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itemsWrapper}>
              {items.map((item) => {
                const badgeCfg = getStatusConfig(item.itemStatus);
                const isItemServing = servingItemId === item.id;
                return (
                  <View key={item.id} style={styles.dishCard}>
                    <View style={styles.dishImageWrap}>
                      <Utensils size={22} color={theme.colors.primary} />
                    </View>

                    <View style={styles.dishContent}>
                      <View style={styles.dishTitleRow}>
                        <Text style={styles.dishName}>
                          {item.menuItem?.name || 'Món ăn'}
                        </Text>
                        <Text style={styles.dishPrice}>
                          {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
                        </Text>
                      </View>

                      <Text style={styles.dishSub}>
                        Số lượng: x{item.quantity}
                        {item.notes ? ` • Ghi chú: ${item.notes}` : ''}
                      </Text>

                      <View style={styles.dishStatusRow}>
                        <View
                          style={[
                            styles.statusTag,
                            {
                              backgroundColor: badgeCfg.bg,
                              borderColor: badgeCfg.border,
                            },
                          ]}
                        >
                          <Text style={[styles.statusTagText, { color: badgeCfg.text }]}>
                            {badgeCfg.label}
                          </Text>
                        </View>

                        {/* Nút SERVE nếu bếp đã nấu xong */}
                        {item.itemStatus === 'READY' && (
                          <TouchableOpacity
                            style={[
                              styles.serveBtn,
                              isItemServing && { opacity: 0.6 },
                            ]}
                            onPress={() => handleServeItem(item.id)}
                            disabled={isItemServing}
                            activeOpacity={0.85}
                          >
                            {isItemServing ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <>
                                <CheckCircle2 size={13} color="#FFFFFF" />
                                <Text style={styles.serveBtnText}>ĐÃ PHỤC VỤ</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnAddItem}
          onPress={() =>
            navigation.navigate(ROUTES.STACKS.CREATE_ORDER, {
              tableId,
              tableNumber,
              existingOrderId: order?.id,
            })
          }
          activeOpacity={0.85}
        >
          <Plus size={18} color={theme.colors.primaryDark} />
          <Text style={styles.btnAddText}>Thêm món</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPayment}
          onPress={() => {
            Alert.alert(
              'Yêu cầu thanh toán',
              `Báo thu ngân in hoá đơn thanh toán cho Bàn ${tableNumber}?`,
              [
                { text: 'Huỷ', style: 'cancel' },
                {
                  text: 'Gửi yêu cầu',
                  onPress: () => {
                    Alert.alert('Đã gửi', 'Thu ngân đã nhận được yêu cầu thanh toán.');
                  },
                },
              ]
            );
          }}
          activeOpacity={0.88}
        >
          <Receipt size={18} color="#FFFFFF" />
          <Text style={styles.btnPaymentText}>Yêu cầu thanh toán</Text>
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
  clearTableTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceAlt,
  },
  clearTableTopText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
  },

  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  scrollArea: { paddingHorizontal: 20, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 10,
    ...theme.shadow.sm,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tableName: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  guestText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
  topRightCol: { alignItems: 'flex-end', gap: 4 },
  servingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#15803D' },
  servingText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  durationText: { fontSize: 11, color: theme.colors.textMuted },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 14 },
  summaryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 2,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryLight,
  },
  quickAddText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeader: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  readyAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  readyAlertText: { fontSize: 11, fontWeight: 'bold', color: '#15803D' },

  emptyOrderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyOrderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emptyOrderSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  startOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    marginTop: 8,
  },
  startOrderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  itemsWrapper: { gap: 10 },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
    ...theme.shadow.sm,
  },
  dishImageWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishContent: { flex: 1 },
  dishTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishName: { fontSize: 14, fontWeight: '700', color: theme.colors.text, flex: 1 },
  dishPrice: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  dishSub: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  dishStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusTagText: { fontSize: 10, fontWeight: '700' },
  serveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#15803D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  serveBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadow.lg,
  },
  btnAddItem: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
  },
  btnAddText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  btnPayment: {
    flex: 1.4,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...theme.shadow.sm,
  },
  btnPaymentText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
