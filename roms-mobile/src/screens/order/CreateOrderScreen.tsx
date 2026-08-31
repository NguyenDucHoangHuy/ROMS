import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, Plus, Minus, Send, Utensils } from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

const dishImage = require('../../../assets/dish_placeholder.png');

const CATEGORIES = ['All Items', 'Starters', 'Mains', 'Drinks'];

const DISHES = [
  { id: 'd1', name: 'Seared Scallops', desc: 'Pea purée, crispy pancetta, micro herbs', price: 24.0 },
  { id: 'd2', name: 'Wagyu Ribeye', desc: '8oz, truffle mash, red wine jus', price: 68.0 },
  { id: 'd3', name: 'Burrata Caprese', desc: 'Heirloom tomatoes, aged balsamic, fresh basil', price: 18.0 },
  { id: 'd4', name: 'Filet Mignon', desc: '6oz center cut, asparagus, garlic butter', price: 54.0 },
];

export const CreateOrderScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const tableNumber = route?.params?.tableNumber || '12';
  const [selectedCat, setSelectedCat] = useState('All Items');
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({ d2: 2 });

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalAmount = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const item = DISHES.find((d) => d.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={theme.colors.text} />
          <Text style={styles.backTitle}>ROMS</Text>
        </TouchableOpacity>
        <View style={styles.tableBadge}>
          <Text style={styles.tableBadgeText}>Table {tableNumber}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.headerAvatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.catSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu List */}
      <ScrollView contentContainerStyle={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {DISHES.map((dish) => {
          const qty = quantities[dish.id] || 0;
          return (
            <View key={dish.id} style={styles.dishCard}>
              <View style={styles.dishImageWrap}>
                <Image source={dishImage} style={styles.dishImage} />
              </View>

              <View style={styles.dishInfo}>
                <Text style={styles.dishTitle}>{dish.name}</Text>
                <Text style={styles.dishDesc} numberOfLines={1}>
                  {dish.desc}
                </Text>
                <Text style={styles.dishPrice}>${dish.price.toFixed(2)}</Text>
              </View>

              {qty > 0 ? (
                <View style={styles.qtyBox}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(dish.id, -1)}>
                    <Minus size={12} color={theme.colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(dish.id, 1)}>
                    <Plus size={12} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBtn} onPress={() => updateQty(dish.id, 1)}>
                  <Plus size={16} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomSection}>
        <View style={styles.orderSummaryCard}>
          <View style={styles.orderLeft}>
            <Text style={styles.orderLabel}>CURRENT ORDER</Text>
            <Text style={styles.orderTotal}>${totalAmount > 0 ? totalAmount.toFixed(2) : '160.00'}</Text>
          </View>
          <TouchableOpacity style={styles.sendKitchenBtn} activeOpacity={0.88}>
            <Text style={styles.sendKitchenText}>Send to Kitchen</Text>
            <Send size={15} color="#FFF" />
          </TouchableOpacity>
        </View>
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
    paddingVertical: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  tableBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tableBadgeText: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  headerAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.border },
  searchSection: { paddingHorizontal: 16, marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE6DA',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: theme.colors.text },
  catSection: { marginVertical: 10 },
  catRow: { paddingHorizontal: 16, gap: 8 },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catPillActive: { backgroundColor: theme.colors.primaryDark, borderColor: theme.colors.primaryDark },
  catText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  catTextActive: { color: '#FFF' },
  menuScroll: { paddingHorizontal: 16, paddingBottom: 110, gap: 10 },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dishImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dishImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  dishInfo: { flex: 1 },
  dishTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  dishDesc: { fontSize: 11, color: theme.colors.textMuted, marginVertical: 2 },
  dishPrice: { fontSize: 13, fontWeight: '800', color: theme.colors.primary },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 4,
    gap: 8,
  },
  qtyBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
  bottomSection: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  orderSummaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  orderLeft: { paddingLeft: 6 },
  orderLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },
  orderTotal: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginTop: 2 },
  sendKitchenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  sendKitchenText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});