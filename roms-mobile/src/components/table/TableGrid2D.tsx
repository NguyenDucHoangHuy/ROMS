import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Users, Clock, Sparkles } from 'lucide-react-native';
import type { Table } from '@/types';
import { theme } from '@/theme';

interface TableGrid2DProps {
  tables: Table[];
  onSelectTable: (table: Table) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

export const TableGrid2D: React.FC<TableGrid2DProps> = ({ tables, onSelectTable }) => {
  const getStatusConfig = (status: Table['status']) => {
    switch (status) {
      case 'OCCUPIED':
        return {
          cardBg: theme.colors.occupiedBg,
          borderColor: theme.colors.occupiedBorder,
          circleBg: theme.colors.primary,
          circleText: '#FFFFFF',
          badgeText: 'Occupied',
          textColor: theme.colors.occupied,
        };
      case 'AVAILABLE':
        return {
          cardBg: theme.colors.availableBg,
          borderColor: theme.colors.availableBorder,
          circleBg: '#D6D1C7',
          circleText: '#5A5348',
          badgeText: 'Available',
          textColor: theme.colors.available,
        };
      case 'RESERVED':
        return {
          cardBg: theme.colors.reservedBg,
          borderColor: theme.colors.reservedBorder,
          circleBg: theme.colors.reserved,
          circleText: '#FFFFFF',
          badgeText: 'Reserved',
          textColor: theme.colors.reserved,
        };
      case 'CLEANING':
      default:
        return {
          cardBg: theme.colors.cleaningBg,
          borderColor: theme.colors.cleaningBorder,
          circleBg: '#D6D1C7',
          circleText: '#5A5348',
          badgeText: 'Cleaning',
          textColor: theme.colors.cleaning,
        };
    }
  };

  return (
    <View style={styles.gridContainer}>
      {tables.map((table) => {
        const config = getStatusConfig(table.status);
        const isVip = table.zone?.toLowerCase().includes('vip');

        if (isVip) {
          return (
            <TouchableOpacity
              key={table.id}
              style={[
                styles.vipCard,
                { backgroundColor: config.cardBg, borderColor: config.borderColor },
              ]}
              onPress={() => onSelectTable(table)}
              activeOpacity={0.85}
            >
              <View style={[styles.idCircle, { backgroundColor: config.circleBg }]}>
                <Text style={[styles.idText, { color: config.circleText }]}>{table.name.replace('Bàn ', '')}</Text>
              </View>
              <View style={styles.vipInfo}>
                <View style={styles.vipBadge}>
                  <Sparkles size={11} color={theme.colors.primaryDark} />
                  <Text style={styles.vipBadgeText}>VIP AREA</Text>
                </View>
                <Text style={styles.cardTitle}>{table.name}</Text>
                <Text style={styles.cardSub}>{table.capacity} chỗ ngồi</Text>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={table.id}
            style={[
              styles.tableCard,
              { backgroundColor: config.cardBg, borderColor: config.borderColor },
            ]}
            onPress={() => onSelectTable(table)}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View style={[styles.idCircle, { backgroundColor: config.circleBg }]}>
                <Text style={[styles.idText, { color: config.circleText }]}>
                  {table.name.replace('Bàn ', '')}
                </Text>
              </View>
              <Text style={[styles.statusBadgeText, { color: config.textColor }]}>
                {config.badgeText}
              </Text>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.cardTitle}>{table.name}</Text>
              <View style={styles.metaRow}>
                <Users size={12} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{table.capacity} chỗ</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tableCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBottom: {
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  vipCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 2,
  },
  vipInfo: {
    flex: 1,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});