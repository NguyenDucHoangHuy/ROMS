import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, CornerDownRight, Plus, Send, MessageSquare } from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useActiveTableStore } from '@/stores/useActiveTableStore';

interface SummaryItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
}

const MOCK_ORDER_ITEMS: SummaryItem[] = [
  {
    id: '1',
    name: 'Special Beef Pho',
    price: 85000,
    qty: 1,
    note: 'Less noodles, clear broth',
  },
  {
    id: '2',
    name: 'Shrimp & Pork Rolls',
    price: 60000,
    qty: 2,
    note: 'No peanuts',
  },
  {
    id: '3',
    name: 'Iced Milk Coffee',
    price: 35000,
    qty: 1,
  },
];

export const OrderSummaryScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const tableNumber = route?.params?.tableNumber || '04';
  const guests = route?.params?.guests || 2;
  const [generalNote, setGeneralNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const clearCart = useActiveTableStore((state) => state.clearCart);

  const totalQty = MOCK_ORDER_ITEMS.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = MOCK_ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSendToKitchen = () => {
    Alert.alert(
      'Gửi Bếp (KDS)',
      `Xác nhận gửi ${totalQty} món xuống Bếp cho Bàn ${tableNumber}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Gửi ngay',
          style: 'default',
          onPress: () => {
            clearCart();
            navigation.popToTop();
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Table & Guest Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.tableName}>Table {tableNumber}</Text>
          <Text style={styles.guestCount}>Guests: {guests}</Text>
        </View>

        {/* Order Item Cards */}
        <View style={styles.itemsList}>
          {MOCK_ORDER_ITEMS.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>x{item.qty}</Text>
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {(item.price * item.qty).toLocaleString('vi-VN')}đ
                  </Text>
                </View>

                {item.note ? (
                  <View style={styles.noteRow}>
                    <CornerDownRight size={12} color={theme.colors.textMuted} />
                    <Text style={styles.noteText}>{item.note}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* General Note Box */}
        {showNoteInput ? (
          <View style={styles.noteInputCard}>
            <View style={styles.noteInputHeader}>
              <MessageSquare size={14} color={theme.colors.primaryDark} />
              <Text style={styles.noteInputTitle}>Ghi chú chung cho đơn</Text>
            </View>
            <TextInput
              style={styles.noteTextInput}
              placeholder="VD: Khách ăn trước món khai vị, phục vụ nước ngay..."
              placeholderTextColor={theme.colors.textMuted}
              value={generalNote}
              onChangeText={setGeneralNote}
              multiline
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.btnAddNote}
            onPress={() => setShowNoteInput(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color={theme.colors.primaryDark} />
            <Text style={styles.btnAddNoteText}>Add general note</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomCard}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>ITEMS</Text>
            <Text style={styles.itemCountVal}>{totalQty} items</Text>
          </View>
          <View style={styles.totalRightCol}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalAmountVal}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnSendKitchen}
          onPress={handleSendToKitchen}
          activeOpacity={0.88}
        >
          <Send size={16} color="#FFF" />
          <Text style={styles.btnSendText}>Send to Kitchen</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  scrollArea: { paddingHorizontal: 16, paddingBottom: 120 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tableName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  guestCount: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' },
  itemsList: { gap: 10, marginTop: 4 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  qtyBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF3E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  qtyText: { fontSize: 14, fontWeight: '800', color: theme.colors.primaryDark },
  itemDetails: { flex: 1 },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  itemPrice: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  noteText: { fontSize: 11, color: theme.colors.textMuted, fontStyle: 'italic' },
  btnAddNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3ECE0',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 14,
  },
  btnAddNoteText: { fontSize: 13, fontWeight: '700', color: theme.colors.primaryDark },
  noteInputCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 14,
    gap: 8,
  },
  noteInputHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noteInputTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.primaryDark },
  noteTextInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: theme.colors.text,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  totalLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },
  itemCountVal: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  totalRightCol: { alignItems: 'flex-end' },
  totalAmountVal: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginTop: 2 },
  btnSendKitchen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
  },
  btnSendText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});