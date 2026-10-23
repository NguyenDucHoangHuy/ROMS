import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Search,
  Plus,
  Minus,
  Utensils,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';
import {
  menuService,
  CategoryData,
  MenuItemData,
} from '@/services/menuService';

export const CreateOrderScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const tableId = route?.params?.tableId;
  const tableNumber = route?.params?.tableNumber || '---';
  const existingOrderId = route?.params?.existingOrderId;

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [dishes, setDishes] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const [catList, dishList] = await Promise.all([
        menuService.getCategories(),
        menuService.getMenuItems(),
      ]);
      setCategories(Array.isArray(catList) ? catList : []);
      setDishes(Array.isArray(dishList) ? dishList : []);
    } catch (e) {
      console.warn('Lỗi tải thực đơn:', e);
      Alert.alert('Thông báo', 'Không thể tải danh sách thực đơn từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

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

  // Lọc món theo category và từ khoá tìm kiếm
  const filteredDishes = dishes.filter((dish) => {
    const matchCat =
      selectedCatId === 'all' || dish.categoryId === selectedCatId;
    const matchSearch =
      !search.trim() ||
      dish.name.toLowerCase().includes(search.toLowerCase().trim());
    return matchCat && matchSearch;
  });

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const dish = dishes.find((d) => d.id === id);
    return sum + (dish?.price || 0) * qty;
  }, 0);

  const handleProceedToSummary = () => {
    if (totalItems === 0) {
      Alert.alert('Chưa chọn món', 'Vui lòng chọn ít nhất 1 món ăn.');
      return;
    }

    const selectedList = Object.entries(quantities).map(([id, qty]) => {
      const dish = dishes.find((d) => d.id === id)!;
      return {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        qty,
        note: notes[id] || '',
      };
    });

    navigation.navigate(ROUTES.STACKS.ORDER_SUMMARY, {
      tableId,
      tableNumber,
      existingOrderId,
      items: selectedList,
      totalAmount,
    });
  };

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.colors.text} />
          <Text style={styles.backTitle}>Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.tableBadge}>
          <Text style={styles.tableBadgeText}>Bàn {tableNumber}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn trong thực đơn..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.catSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          <TouchableOpacity
            style={[
              styles.catPill,
              selectedCatId === 'all' && styles.catPillActive,
            ]}
            onPress={() => setSelectedCatId('all')}
          >
            <Text
              style={[
                styles.catText,
                selectedCatId === 'all' && styles.catTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const active = selectedCatId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCatId(cat.id)}
              >
                <Text
                  style={[styles.catText, active && styles.catTextActive]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải thực đơn...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.menuScroll}
          showsVerticalScrollIndicator={false}
        >
          {filteredDishes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Utensils size={40} color={theme.colors.borderDark} />
              <Text style={styles.emptyText}>Không tìm thấy món ăn nào.</Text>
            </View>
          ) : (
            filteredDishes.map((dish) => {
              const qty = quantities[dish.id] || 0;
              return (
                <View key={dish.id} style={styles.dishCard}>
                  <Image
                    source={
                      dish.imageUrl
                        ? { uri: dish.imageUrl }
                        : require('../../../assets/dish_placeholder.png')
                    }
                    style={styles.dishImg}
                  />
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName}>{dish.name}</Text>
                    {dish.description ? (
                      <Text style={styles.dishDesc} numberOfLines={2}>
                        {dish.description}
                      </Text>
                    ) : null}
                    <Text style={styles.dishPrice}>
                      {dish.price.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  {/* Quantity Controller */}
                  <View style={styles.qtyCol}>
                    {qty > 0 ? (
                      <View style={styles.qtyControl}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQty(dish.id, -1)}
                        >
                          <Minus size={14} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyNumber}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQty(dish.id, 1)}
                        >
                          <Plus size={14} color={theme.colors.text} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => updateQty(dish.id, 1)}
                      >
                        <Plus size={18} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Bottom Sticky Action Bar */}
      {totalItems > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>
              {totalItems} món đã chọn
            </Text>
            <Text style={styles.bottomTotal}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </Text>
          </View>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleProceedToSummary}
            activeOpacity={0.88}
          >
            <Text style={styles.submitBtnText}>Xem đơn & Gửi bếp</Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  tableBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.occupiedBorder,
  },
  tableBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
  },

  searchSection: { paddingHorizontal: 16, marginBottom: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: theme.colors.text },

  catSection: { marginBottom: 12 },
  catRow: { paddingHorizontal: 16, gap: 8 },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceAlt,
  },
  catPillActive: { backgroundColor: theme.colors.primary },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  catTextActive: { color: theme.colors.textOnPrimary },

  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 13, color: theme.colors.textSecondary },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 13, color: theme.colors.textMuted },

  menuScroll: { paddingHorizontal: 16, paddingBottom: 110, gap: 10 },
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
  dishImg: { width: 68, height: 68, borderRadius: 10, objectFit: 'cover' },
  dishInfo: { flex: 1 },
  dishName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  dishDesc: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  dishPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 4,
  },

  qtyCol: { alignItems: 'center', justifyContent: 'center' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: 'hidden',
  },
  qtyBtn: { padding: 6, alignItems: 'center', justifyContent: 'center' },
  qtyNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
    paddingHorizontal: 8,
  },

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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadow.lg,
  },
  bottomLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
  bottomTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.sm,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
