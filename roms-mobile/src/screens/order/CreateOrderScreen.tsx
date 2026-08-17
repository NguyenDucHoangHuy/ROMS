import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native'
import { theme } from '@/theme'
import type { MenuItem } from '@/types'
import { useActiveTableStore } from '@/stores/useActiveTableStore'

const mockMenuItems: MenuItem[] = [
  { id: 'm1', name: 'Lẩu nấm thiên nhiên', price: 350000, imageUrl: null, isAvailable: true, categoryId: 'cat1' },
  { id: 'm2', name: 'Bò Mỹ cuộn nấm', price: 120000, imageUrl: null, isAvailable: true, categoryId: 'cat1' },
  { id: 'm3', name: 'Bò nướng tảng SOS', price: 250000, imageUrl: null, isAvailable: true, categoryId: 'cat2' },
  { id: 'm4', name: 'Trà đào cam sả', price: 45000, imageUrl: null, isAvailable: true, categoryId: 'cat3' },
]

export const CreateOrderScreen = () => {
  const { activeTable, cartItems, addItem, removeItem } = useActiveTableStore()

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const existing = cartItems.find((i) => i.menuItem.id === item.id)
    const quantity = existing ? existing.quantity : 0

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} ₫</Text>
        </View>

        <View style={styles.quantityContainer}>
          {quantity > 0 && (
            <TouchableOpacity style={styles.btnQty} onPress={() => removeItem(item.id)}>
              <Text style={styles.btnQtyText}>-</Text>
            </TouchableOpacity>
          )}

          {quantity > 0 && <Text style={styles.qtyText}>{quantity}</Text>}

          <TouchableOpacity style={styles.btnQty} onPress={() => addItem(item)}>
            <Text style={styles.btnQtyText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gọi món hộ khách</Text>
        <Text style={styles.subtitle}>
          {activeTable ? `Đang chọn cho: ${activeTable.name}` : 'Chưa chọn bàn'}
        </Text>
      </View>

      <FlatList
        data={mockMenuItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  list: {
    padding: theme.spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnQty: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnQtyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
})
