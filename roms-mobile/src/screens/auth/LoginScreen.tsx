import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Utensils,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

export const LoginScreen = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useWaiterAuthStore((state) => state.login);
  const loginWithCredentials = useWaiterAuthStore(
    (state) => state.loginWithCredentials
  );

  const handleLogin = async () => {
    if (!employeeId.trim() || !pinCode.trim()) {
      // Nếu chưa nhập thông tin, tự động dùng mock login tiện lợi
      login('WAITER');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithCredentials(employeeId.trim(), pinCode.trim());
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại Số điện thoại và Mật khẩu.';
      Alert.alert('Lỗi đăng nhập', msg, [
        {
          text: 'Dùng chế độ Test',
          onPress: () => login('WAITER'),
        },
        { text: 'Thử lại', style: 'cancel' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
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
          <Text style={styles.roleSubTitle}>WAITER PORTAL</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại / Mã nhân viên</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="VD: 0905123456"
                placeholderTextColor={theme.colors.textMuted}
                value={employeeId}
                onChangeText={setEmployeeId}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu / PIN</Text>
            <View style={styles.inputWrap}>
              <Lock
                size={16}
                color={theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={pinCode}
                onChangeText={setPinCode}
                secureTextEntry={!showPin}
              />
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={styles.eyeBtn}
              >
                {showPin ? (
                  <EyeOff size={16} color={theme.colors.textMuted} />
                ) : (
                  <Eye size={16} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Nút Đăng nhập chính */}
          <TouchableOpacity
            style={[styles.btnAuthenticate, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.btnText}>Đăng nhập</Text>
                <ArrowRight size={18} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Nút Đăng nhập nhanh Test Mode */}
          <TouchableOpacity
            style={styles.quickLoginBtn}
            onPress={handleQuickLogin}
            activeOpacity={0.8}
          >
            <Zap size={14} color={theme.colors.primary} />
            <Text style={styles.quickLoginText}>
              Đăng nhập nhanh (Test Mode)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.secureRow}>
            <ShieldCheck size={14} color={theme.colors.textMuted} />
            <Text style={styles.secureText}>Kết nối bảo mật tới ROMS Server</Text>
          </View>
          <Text style={styles.versionText}>ROMS Mobile v2.0</Text>
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
    marginBottom: 12,
    ...theme.shadow.sm,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  roleSubTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 3,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
    ...theme.shadow.md,
  },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: {
    fontSize: 14,
    color: theme.colors.text,
    paddingVertical: 0,
  },
  eyeBtn: { padding: 6 },
  btnAuthenticate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
    marginTop: 4,
    ...theme.shadow.sm,
  },
  btnText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  quickLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryLight,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.occupiedBorder,
  },
  quickLoginText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footer: { alignItems: 'center', marginTop: 32, gap: 4 },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { fontSize: 11, color: theme.colors.textMuted },
  versionText: { fontSize: 10, color: theme.colors.textMuted },
});
