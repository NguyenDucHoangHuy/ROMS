import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Settings,
  Radio,
  Fingerprint,
  RotateCcw,
  History,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore';
import { ROUTES } from '@/constants/routes';

const WEEKLY_SCHEDULE = [
  {
    day: 'MON (12/10)',
    shiftName: 'Morning Shift',
    time: '08:00 - 15:00',
    isToday: true,
  },
  {
    day: 'TUE (13/10)',
    shiftName: 'Afternoon Shift',
    time: '15:00 - 22:00',
    isToday: false,
  },
  {
    day: 'WED (14/10)',
    shiftName: 'Evening Shift',
    time: '18:00 - 23:00',
    isToday: false,
  },
  {
    day: 'THU (15/10)',
    shiftName: 'Off',
    time: 'OFF',
    isToday: false,
    isOff: true,
  },
];

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useWaiterAuthStore();

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Settings size={19} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>VA</Text>
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{user?.name || 'Nguyễn Văn An'}</Text>
          <Text style={styles.userRole}>ID: W-8924 | Senior Waiter</Text>
        </View>

        {/* GPS Attendance Box */}
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceTopRow}>
            <View style={styles.attLeft}>
              <View style={styles.attIconCircle}>
                <Radio size={16} color="#EA580C" />
              </View>
              <View>
                <Text style={styles.attTitle}>GPS Attendance</Text>
                <Text style={styles.attSub}>Currently in restaurant area</Text>
              </View>
            </View>
            <View style={styles.attRight}>
              <Text style={styles.attTime}>08:15</Text>
              <Text style={styles.attShift}>Morning shift</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnCheckIn}
            onPress={() => navigation.navigate(ROUTES.STACKS.SHIFT_CHECK_IN)}
            activeOpacity={0.88}
          >
            <Fingerprint size={18} color="#FFF" />
            <Text style={styles.btnCheckInText}>Tap to check in GPS</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          <View style={styles.scheduleGrid}>
            {WEEKLY_SCHEDULE.map((item, idx) => (
              <View key={idx} style={styles.scheduleCard}>
                <View style={styles.scheduleHeaderRow}>
                  <Text style={styles.scheduleDay}>{item.day}</Text>
                  {item.isToday && (
                    <View style={styles.todayTag}>
                      <Text style={styles.todayTagText}>Today</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.scheduleShiftName, item.isOff && styles.textMutedCustom]}
                >
                  {item.shiftName}
                </Text>
                <Text style={styles.scheduleTime}>{item.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items Card */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
            <View style={styles.menuIconCircle}>
              <RotateCcw size={16} color={theme.colors.primaryDark} />
            </View>
            <Text style={styles.menuLabel}>Change Password</Text>
            <ChevronRight size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
            <View style={styles.menuIconCircle}>
              <History size={16} color={theme.colors.primaryDark} />
            </View>
            <Text style={styles.menuLabel}>Attendance History</Text>
            <ChevronRight size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={logout} activeOpacity={0.7}>
            <View style={[styles.menuIconCircle, styles.logoutIconBg]}>
              <LogOut size={16} color="#DC2626" />
            </View>
            <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Logout</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  scrollArea: { paddingHorizontal: 16, paddingBottom: 60 },
  profileSection: { alignItems: 'center', marginVertical: 14 },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FAF3E8',
    borderWidth: 2,
    borderColor: '#E8CA94',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: theme.colors.primaryDark },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#FFF',
  },
  userName: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  userRole: { fontSize: 12, color: theme.colors.textMuted, marginTop: 3 },
  attendanceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  attendanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  attSub: { fontSize: 10, color: theme.colors.textMuted, marginTop: 1 },
  attRight: { alignItems: 'flex-end' },
  attTime: { fontSize: 14, fontWeight: '800', color: theme.colors.text },
  attShift: { fontSize: 10, color: theme.colors.textMuted, marginTop: 1 },
  btnCheckIn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 14,
    gap: 8,
  },
  btnCheckInText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  scheduleCard: {
    width: '48.5%',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scheduleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleDay: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted },
  todayTag: {
    backgroundColor: '#B91C1C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayTagText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  scheduleShiftName: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginTop: 6 },
  textMutedCustom: { color: theme.colors.textMuted },
  scheduleTime: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconBg: { backgroundColor: '#FEE2E2' },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.colors.text },
  menuDivider: { height: 1, backgroundColor: theme.colors.borderLight },
});