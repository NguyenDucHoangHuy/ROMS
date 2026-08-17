import React from 'react'
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native'
import type { Table } from '@/types'
import { theme } from '@/theme'

interface TableGrid2DProps {
  tables: Table[]
  onSelectTable: (table: Table) => void
}

export const TableGrid2D: React.FC<TableGrid2DProps> = ({ tables, onSelectTable }) => {
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return theme.colors.available
      case 'RESERVED':
        return theme.colors.reserved
      case 'OCCUPIED':
        return theme.colors.occupied
      case 'CLEANING':
        return theme.colors.cleaning
      default:
        return theme.colors.card
    }
  }

  const renderTable = ({ item }: { item: Table }) => {
    const statusColor = getStatusColor(item.status)

    return (
      <TouchableOpacity
        style={[styles.tableCard, { borderColor: statusColor }]}
        onPress={() => onSelectTable(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{item.status[0]}</Text>
        </View>
        <Text style={styles.tableName}>{item.name}</Text>
        <Text style={styles.capacityText}>{item.capacity} chỗ</Text>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={tables}
      keyExtractor={(item) => item.id}
      renderItem={renderTable}
      numColumns={3}
      contentContainerStyle={styles.container}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  tableCard: {
    flex: 1,
    margin: theme.spacing.xs,
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  capacityText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
})
