import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Utensils, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { theme } from '@/theme';
import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

export const LoginScreen = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const login = useWaiterAuthStore((state) => state.login);

  const handleLogin = () => {
    login('WAITER');
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentWrapper}
      >
        {/* Logo Header */}
        <View style={styles.logoSection}>
          <View style={styles.logoBadge}>
            <Utensils size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.appTitle}>ROMS</Text>
          <Text style={styles.roleSubTitle}>LOGIN</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employee ID / Phone</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. 10452"
                placeholderTextColor={theme.colors.textMuted}
                value={employeeId}
                onChangeText={setEmployeeId}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN Code</Text>
            <View style={styles.inputWrap}>
              <Lock size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••"
                placeholderTextColor={theme.colors.textMuted}
                value={pinCode}
                onChangeText={setPinCode}
                secureTextEntry={!showPin}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.eyeBtn}>
                {showPin ? (
                  <EyeOff size={16} color={theme.colors.textMuted} />
                ) : (
                  <Eye size={16} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.btnAuthenticate} onPress={handleLogin} activeOpacity={0.88}>
            <Text style={styles.btnText}>Authenticate</Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.troubleBtn} activeOpacity={0.7}>
            <Text style={styles.troubleText}>Trouble logging in?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.secureRow}>
            <ShieldCheck size={14} color={theme.colors.textMuted} />
            <Text style={styles.secureText}>Secure Connection</Text>
          </View>
          <Text style={styles.versionText}>ROMS v2.4.1 (Stable)</Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  contentWrapper: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 28 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#1A1209',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  appTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text, letterSpacing: 2 },
  roleSubTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.primary, letterSpacing: 1.5, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#1A1209',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { fontSize: 14, color: theme.colors.text },
  eyeBtn: { padding: 4 },
  btnAuthenticate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  troubleBtn: { alignItems: 'center', marginTop: 16 },
  troubleText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
  footer: { alignItems: 'center', marginTop: 36, gap: 4 },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500' },
  versionText: { fontSize: 10, color: theme.colors.textMuted },
});