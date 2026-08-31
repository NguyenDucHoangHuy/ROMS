import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  CheckCheck,
  Bell,
  Utensils,
  Wine,
  Receipt,
  AlertCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

const RECENT_NOTIFS = [
  {
    id: 'n1',
    table: 'Table 12',
    title: 'Mains are ready',
    desc: '2x Filet Mignon, 1x Seared Scallops',
    time: 'Just now',
    icon: Utensils,
    iconBg: '#FDF3E3',
    iconColor: '#BA833F',
    unread: true,
  },
  {
    id: 'n2',
    table: 'Table 04',
    title: 'Service requested',
    desc: 'Guest pressed the call button.',
    time: '2m ago',
    icon: Bell,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    unread: true,
  },
  {
    id: 'n3',
    table: 'Table 08',
    title: 'Drinks ready at bar',
    desc: 'Round of signature cocktails.',
    time: '5m ago',
    icon: Wine,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    unread: true,
  },
];

const EARLIER_NOTIFS = [
  {
    id: 'n4',
    table: 'Table 21',
    title: 'Bill requested',
    desc: 'Guest is ready to pay.',
    time: '18m ago',
    icon: Receipt,
    iconBg: '#F5F5F4',
    iconColor: '#78716C',
    unread: false,
  },
  {
    id: 'n5',
    table: 'System',
    title: 'Menu 86 Update',
    desc: 'Truffle Risotto is out of stock.',
    time: '1h ago',
    icon: AlertCircle,
    iconBg: '#F5F5F4',
    iconColor: '#78716C',
    unread: false,
  },
];

export const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.headerAvatar} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ROMS</Text>
        <Bell size={18} color={theme.colors.textSecondary} />
      </View>

      {/* Section Title */}
      <View style={styles.titleSection}>
        <View>
          <Text style={styles.mainTitle}>Alerts</Text>
          <Text style={styles.subTitle}>3 new notifications</Text>
        </View>
        <TouchableOpacity style={styles.markReadBtn}>
          <CheckCheck size={14} color={theme.colors.primaryDark} />
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {/* Recent Alerts */}
        <View style={styles.group}>
          {RECENT_NOTIFS.map((item) => {
            const IconComp = item.icon;
            return (
              <View key={item.id} style={styles.notifCard}>
                <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                  <IconComp size={16} color={item.iconColor} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifRow}>
                    <Text style={styles.tableText}>{item.table}</Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
                {item.unread && <View style={styles.unreadDot} />}
              </View>
            );
          })}
        </View>

        {/* Earlier Section */}
        <Text style={styles.sectionDividerText}>EARLIER</Text>
        <View style={styles.group}>
          {EARLIER_NOTIFS.map((item) => {
            const IconComp = item.icon;
            return (
              <View key={item.id} style={styles.notifCard}>
                <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                  <IconComp size={16} color={item.iconColor} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifRow}>
                    <Text style={styles.tableText}>{item.table}</Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, letterSpacing: 1 },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  mainTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  subTitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markReadText: { fontSize: 11, fontWeight: '600', color: theme.colors.primaryDark },
  listScroll: { paddingHorizontal: 16, paddingBottom: 80, gap: 10 },
  group: { gap: 10 },
  sectionDividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableText: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  timeText: { fontSize: 10, color: theme.colors.textMuted },
  itemTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
  itemDesc: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
    marginLeft: 8,
  },
});