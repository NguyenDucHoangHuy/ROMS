import React, { useState } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native'
import { theme } from '@/theme'
import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore'

export const LoginScreen = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useWaiterAuthStore((state) => state.setAuth)

  const handleLogin = async () => {
    // Demo login
    const mockUser = {
      id: 'waiter-1',
      name: 'Nhân viên Phục vụ 1',
      phone: phone || '0901234567',
      role: 'WAITER' as any,
      isActive: true,
    }
    await setAuth(mockUser, 'mock-jwt-token')
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <Text style={styles.title}>ROMS Mobile</Text>
        <Text style={styles.subtitle}>Dành cho Nhân viên Phục vụ & Vận hành</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Số điện thoại / Mã nhân viên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại"
          placeholderTextColor={theme.colors.textMuted}
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
