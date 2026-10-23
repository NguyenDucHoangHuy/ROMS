import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Utensils,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';
import { orderService } from '@/services/orderService';

export const OrderSummaryScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const tableId = route?.params?.tableId;
  const tableNumber = route?.params?.tableNumber || '---';
  const existingOrderId = route?.params?.existingOrderId;
  const items: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    note?: string;
  }> = route?.params?.items || [];

  const [generalNote, setGeneralNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSendToKitchen = () => {
    Alert.alert(
      'Gửi Bếp (KDS)',
      `Xác nhận gửi ${totalQty} món xuống Bếp cho Bàn ${tableNumber}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Gửi ngay',
          style: 'default',
          onPress: submitOrderToKitchen,
        },
      ]
    );
  };

  const submitOrderToKitchen = async () => {
    setIsSubmitting(true);
    try {
      const orderPayloadItems = items.map((i) => ({
        menuItemId: i.id,
        quantity: i.qty,
        notes: [i.note, generalNote].filter(Boolean).join(' | '),
      }));

      if (existingOrderId) {
        // Thêm món vào đơn đang có của bàn
        await orderService.addItems(existingOrderId, orderPayloadItems);
      } else {
        // Tạo đơn gọi món mới cho bàn
        if (!tableId) {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin bàn.');
          return;
        }
        await orderService.create({
          tableId,
          items: orderPayloadItems,
        });
      }

      Alert.alert(
        'Đã gửi Bếp thành công! 🍳',
        `Đã gửi ${totalQty} món cho Bàn ${tableNumber}. Bếp đã nhận được thông tin để bắt đầu chế biến.`,
        [
          {
            text: 'Về Chi tiết bàn',
            onPress: () => {
              navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, {
                tableId,
                tableNumber,
              });
            },
          },
        ]
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        'Không thể gửi đơn xuống Bếp. Vui lòng thử lại.';
      Alert.alert('Lỗi gửi bếp', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.colors.text} />
          <Text style={styles.backTitle}>Chọn lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận gọi món</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* Table Banner */}
        <View style={styles.tableBanner}>
          <View>
            <Text style={styles.bannerTableText}>Bàn {tableNumber}</Text>
            <Text style={styles.bannerSubText}>
              {existingOrderId ? 'Gọi thêm vào đơn đang phục vụ' : 'Đơn gọi món mới'}
            </Text>
          </View>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>{totalQty} món</Text>
          </View>
        </View>

        {/* Selected Dishes List */}
        <Text style={styles.sectionTitle}>Món ăn đã chọn ({items.length})</Text>
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString('vi-VN')} đ × {item.qty}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {(item.price * item.qty).toLocaleString('vi-VN')} đ
                </Text>
              </View>
              {item.note ? (
                <View style={styles.itemNoteBadge}>
                  <Text style={styles.itemNoteText}>💬 {item.note}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* General Kitchen Note */}
        <View style={styles.noteSection}>
          <TouchableOpacity
            style={styles.noteToggleRow}
            onPress={() => setShowNoteInput((prev) => !prev)}
          >
            <View style={styles.noteToggleLeft}>
              <MessageSquare size={16} color={theme.colors.primary} />
              <Text style={styles.noteToggleText}>
                {generalNote ? 'Ghi chú cho Bếp' : '+ Thêm ghi chú chung cho Bếp'}
              </Text>
            </View>
            <Text style={styles.noteToggleAction}>
              {showNoteInput ? 'Ẩn' : 'Sửa'}
            </Text>
          </TouchableOpacity>

          {showNoteInput && (
            <TextInput
              style={styles.noteInput}
              placeholder="VD: Không ớt, làm nhanh giúp khách, chia 2 đĩa..."
              placeholderTextColor={theme.colors.textMuted}
              value={generalNote}
              onChangeText={setGeneralNote}
              multiline
              numberOfLines={3}
            />
          )}

          {generalNote && !showNoteInput ? (
            <Text style={styles.notePreviewText}>"{generalNote}"</Text>
          ) : null}
        </View>

        {/* Price Breakdown */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tổng số lượng món</Text>
            <Text style={styles.breakdownValue}>{totalQty} phần</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Send Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.sendBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSendToKitchen}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Send size={18} color="#FFF" />
              <Text style={styles.sendBtnText}>Gửi đơn xuống Bếp (KDS)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  headerTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text },

  scrollArea: { paddingHorizontal: 16, paddingBottom: 100 },
  tableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.occupiedBorder,
    marginTop: 8,
  },
  bannerTableText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  bannerSubText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  qtyBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  qtyBadgeText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  itemsList: { gap: 8 },
  itemCard: {
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  itemPrice: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  itemTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  itemNoteBadge: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  itemNoteText: { fontSize: 11, color: '#92400E', fontStyle: 'italic' },

  noteSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 14,
  },
  noteToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  noteToggleAction: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceSubtle,
    textAlignVertical: 'top',
  },
  notePreviewText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
  },

  breakdownCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 14,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: { fontSize: 13, color: theme.colors.textSecondary },
  breakdownValue: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  totalLabel: { fontSize: 14, fontWeight: '800', color: theme.colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadow.lg,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    height: 50,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
    ...theme.shadow.sm,
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
