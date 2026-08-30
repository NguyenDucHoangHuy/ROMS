import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  Armchair,
  Sparkles,
  Plus,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

const ZONES = ['Main Dining', 'VIP Terrace', 'Bar Area'];

export const TableMapScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedZone, setSelectedZone] = useState('Main Dining');

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImg}
          />
          <Text style={styles.brandTitle}>ROMS</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate(ROUTES.TABS.NOTIFICATIONS)}
        >
          <Bell size={22} color={theme.colors.primary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Zone Tabs */}
      <View style={styles.zoneWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneScroll}>
          {ZONES.map((zone) => {
            const active = selectedZone === zone;
            return (
              <TouchableOpacity
                key={zone}
                style={[styles.zonePill, active && styles.zonePillActive]}
                onPress={() => setSelectedZone(zone)}
                activeOpacity={0.8}
              >
                <Text style={[styles.zoneText, active && styles.zoneTextActive]}>{zone}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Table Grid */}
      <ScrollView contentContainerStyle={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Table 12 - Occupied */}
          <TouchableOpacity
            style={[styles.tableCard, styles.cardOccupied]}
            onPress={() => navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, { tableNumber: '12' })}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.circleNumberOccupied}>
                <Text style={styles.circleNumberTextWhite}>12</Text>
              </View>
              <View style={styles.badgeOccupied}>
                <View style={styles.dotOrange} />
                <Text style={styles.badgeOccupiedText}>Occupied</Text>
              </View>
            </View>
            <View style={styles.cardBottomRow}>
              <View style={styles.infoItem}>
                <Users size={13} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>4/4</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock size={13} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>45m</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Table 14 - Available */}
          <TouchableOpacity
            style={[styles.tableCard, styles.cardAvailable]}
            onPress={() => navigation.navigate(ROUTES.STACKS.CREATE_ORDER, { tableNumber: '14' })}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.circleNumberAvailable}>
                <Text style={styles.circleNumberTextGreen}>14</Text>
              </View>
              <View style={styles.badgeAvailable}>
                <Text style={styles.badgeAvailableText}>Available</Text>
              </View>
            </View>
            <View style={styles.cardBottomRow}>
              <View style={styles.infoItem}>
                <Armchair size={13} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>2 seats</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock size={13} color={theme.colors.textMuted} />
                <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>-</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Table 15 - Reserved */}
          <TouchableOpacity
            style={[styles.tableCard, styles.cardReserved]}
            onPress={() => navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, { tableNumber: '15' })}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.circleNumberReserved}>
                <Text style={styles.circleNumberTextBlue}>15</Text>
              </View>
              <View style={styles.badgeReserved}>
                <Text style={styles.badgeReservedText}>Reserved</Text>
              </View>
            </View>
            <Text style={styles.reservedPartyName}>Smith Party</Text>
            <View style={styles.cardBottomRow}>
              <View style={styles.infoItem}>
                <Users size={13} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>6 ppl</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={13} color={theme.colors.reserved} />
                <Text style={[styles.infoText, { color: theme.colors.reserved, fontWeight: '700' }]}>
                  19:30
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Table 16 - Cleaning */}
          <View style={[styles.tableCard, styles.cardCleaning]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.circleNumberCleaning}>
                <Text style={styles.circleNumberTextGray}>16</Text>
              </View>
              <View style={styles.badgeCleaning}>
                <Sparkles size={11} color={theme.colors.textSecondary} />
                <Text style={styles.badgeCleaningText}>Cleaning</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarTrack}>
                <View style={styles.progressBarFill} />
              </View>
            </View>
          </View>

          {/* Table 18 - Occupied (Overdue Alert) */}
          <TouchableOpacity
            style={[styles.tableCard, styles.cardAlert]}
            onPress={() => navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, { tableNumber: '18' })}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.circleNumberAlert}>
                <Text style={styles.circleNumberTextRed}>18</Text>
              </View>
              <View style={styles.badgeAlert}>
                <View style={styles.dotRed} />
                <Text style={styles.badgeAlertText}>Occupied</Text>
              </View>
            </View>
            <View style={styles.cardBottomRow}>
              <View style={styles.infoItem}>
                <Users size={13} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>2/2</Text>
              </View>
              <View style={styles.infoItem}>
                <AlertTriangle size={13} color={theme.colors.error} />
                <Text style={[styles.infoText, { color: theme.colors.error, fontWeight: '700' }]}>
                  115m
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => navigation.navigate(ROUTES.STACKS.CREATE_ORDER, { tableNumber: 'Mới' })}
        activeOpacity={0.9}
      >
        <Plus size={28} color={theme.colors.textOnPrimary} strokeWidth={2.5} />
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
  avatarImg: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: theme.colors.border },
  brandTitle: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.extrabold, color: theme.colors.primary, letterSpacing: 1.2 },
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
  zoneText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.textSecondary },
  zoneTextActive: { color: theme.colors.textOnPrimary },
  gridScroll: { paddingHorizontal: theme.spacing.md, paddingTop: 12, paddingBottom: 90 },
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
  cardOccupied: { borderLeftWidth: 5, borderLeftColor: theme.colors.occupied, backgroundColor: theme.colors.occupiedBg },
  cardAvailable: { borderLeftWidth: 5, borderLeftColor: theme.colors.available },
  cardReserved: { borderLeftWidth: 5, borderLeftColor: theme.colors.reserved },
  cardCleaning: { backgroundColor: theme.colors.cleaningBg },
  cardAlert: { borderLeftWidth: 5, borderLeftColor: theme.colors.error, backgroundColor: '#FEF2F2' },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleNumberOccupied: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.occupied,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumberTextWhite: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.extrabold, color: theme.colors.textOnPrimary },
  circleNumberAvailable: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.availableBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumberTextGreen: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.extrabold, color: theme.colors.available },
  circleNumberReserved: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.reservedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumberTextBlue: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.extrabold, color: theme.colors.reserved },
  circleNumberCleaning: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumberTextGray: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.extrabold, color: theme.colors.textSecondary },
  circleNumberAlert: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumberTextRed: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.extrabold, color: theme.colors.error },

  badgeOccupied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  dotOrange: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.colors.occupied },
  badgeOccupiedText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.occupied },

  badgeAvailable: {
    backgroundColor: theme.colors.availableBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeAvailableText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.available },

  badgeReserved: {
    backgroundColor: theme.colors.reservedBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeReservedText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.reserved },

  badgeCleaning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeCleaningText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.textSecondary },

  badgeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  dotRed: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.colors.error },
  badgeAlertText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.error },

  reservedPartyName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.semibold, color: theme.colors.textSecondary },

  progressContainer: { marginTop: 24, marginBottom: 8 },
  progressBarTrack: {
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '65%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
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