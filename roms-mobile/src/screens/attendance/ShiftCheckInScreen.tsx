import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Check, MapPin, Clock, Fingerprint } from 'lucide-react-native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

export const ShiftCheckInScreen = () => {
  const navigation = useNavigation<any>();
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleConfirm = () => {
    setIsCheckedIn(true);
    Alert.alert('Thành công', 'Đã ghi nhận điểm danh ca chiều (Hợp lệ 12m)');
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GPS Check-in</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Concentric Radar Circles */}
        <View style={styles.radarWrapper}>
          <View style={styles.radarCircleOuter}>
            <View style={styles.radarCircleMid}>
              <View style={styles.radarCircleInner}>
                <View style={styles.checkIconBadge}>
                  <Check size={26} color="#FFF" strokeWidth={3} />
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.rangeTitle}>Within range</Text>
          <View style={styles.rangeSubRow}>
            <MapPin size={12} color={theme.colors.textMuted} />
            <Text style={styles.rangeSubText}>Within range: 12m</Text>
          </View>
        </View>

        {/* Location Info Card */}
        <View style={styles.locationCard}>
          <Text style={styles.branchName}>ROMS - Bistro Dien Bien Phu</Text>
          <Text style={styles.branchAddress}>
            234 Dien Bien Phu, Vo Thi Sau Ward, District 3, HCMC
          </Text>
        </View>

        {/* Shift Detail Card */}
        <View style={styles.shiftCard}>
          <View style={styles.shiftTopRow}>
            <Text style={styles.shiftLabel}>CURRENT SHIFT</Text>
            <View style={styles.shiftTimeRow}>
              <Clock size={13} color={theme.colors.textSecondary} />
              <Text style={styles.shiftTimeText}>15:00 - 23:00</Text>
            </View>
          </View>
          <Text style={styles.shiftName}>Afternoon Shift</Text>

          <View style={styles.shiftDivider} />

          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Role</Text>
            <Text style={styles.roleValue}>Server</Text>
          </View>
        </View>

        {/* Confirm Check-in Button */}
        <TouchableOpacity
          style={[styles.btnConfirm, isCheckedIn && styles.btnConfirmed]}
          onPress={handleConfirm}
          disabled={isCheckedIn}
          activeOpacity={0.88}
        >
          <Fingerprint size={20} color="#FFF" />
          <Text style={styles.btnConfirmText}>
            {isCheckedIn ? 'Checked In Successfully' : 'Confirm Check-in'}
          </Text>
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
    backgroundColor: '#EDE7DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  radarWrapper: { alignItems: 'center', marginBottom: 24 },
  radarCircleOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#EDE6D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCircleMid: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E4DC source',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCircleInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D9D0BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  rangeTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 14 },
  rangeSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rangeSubText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
  locationCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: 12,
  },
  branchName: { fontSize: 13, fontWeight: '800', color: theme.colors.text, textAlign: 'center' },
  branchAddress: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  shiftCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  shiftTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 0.5 },
  shiftTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shiftTimeText: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },
  shiftName: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 4 },
  shiftDivider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: 10 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleLabel: { fontSize: 12, color: theme.colors.textMuted },
  roleValue: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
  btnConfirm: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnConfirmed: { backgroundColor: '#16A34A' },
  btnConfirmText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});