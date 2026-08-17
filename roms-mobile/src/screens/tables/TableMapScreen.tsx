import React, { useState } from 'react'
import { StyleSheet, View, Text, SafeAreaView } from 'react-native'
import { TableGrid2D } from '@/components/table/TableGrid2D'
import { theme } from '@/theme'
import type { Table } from '@/types'
import { useActiveTableStore } from '@/stores/useActiveTableStore'

const mockTables: Table[] = [
  { id: '1', name: 'Bàn B01', capacity: 4, floor: 1, zone: 'INDOOR', status: 'AVAILABLE', currentOrderId: null, xPosition: 1, yPosition: 1 },
  { id: '2', name: 'Bàn B02', capacity: 2, floor: 1, zone: 'INDOOR', status: 'OCCUPIED', currentOrderId: 'ord-101', xPosition: 1, yPosition: 2 },
  { id: '3', name: 'Bàn B03', capacity: 6, floor: 1, zone: 'INDOOR', status: 'RESERVED', currentOrderId: null, xPosition: 1, yPosition: 3 },
  { id: '4', name: 'Bàn B04', capacity: 4, floor: 1, zone: 'INDOOR', status: 'CLEANING', currentOrderId: null, xPosition: 2, yPosition: 1 },
  { id: '5', name: 'Bàn VIP1', capacity: 10, floor: 1, zone: 'VIP', status: 'AVAILABLE', currentOrderId: null, xPosition: 2, yPosition: 2 },
  { id: '6', name: 'Bàn VIP2', capacity: 8, floor: 1, zone: 'VIP', status: 'OCCUPIED', currentOrderId: 'ord-102', xPosition: 2, yPosition: 3 },
]

export const TableMapScreen = () => {
  const [tables] = useState<Table[]>(mockTables)
  const setActiveTable = useActiveTableStore((state) => state.setActiveTable)

  const handleSelectTable = (table: Table) => {
    setActiveTable(table)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sơ đồ bàn Real-time</Text>
        <Text style={styles.subtitle}>Chạm vào bàn để mở đơn hoặc kiểm tra trạng thái</Text>
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.available }]} />
          <Text style={styles.legendText}>Trống</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.occupied }]} />
          <Text style={styles.legendText}>Đang ăn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.reserved }]} />
          <Text style={styles.legendText}>Đã đặt</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.cleaning }]} />
          <Text style={styles.legendText}>Đang dọn</Text>
        </View>
      </View>

      <TableGrid2D tables={tables} onSelectTable={handleSelectTable} />
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
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
})
