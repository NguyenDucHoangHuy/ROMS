import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { theme } from '@/theme'
import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore'

export const ProfileScreen = () => {
  const { user, logout } = useWaiterAuthStore()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ cá nhân</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || 'W'}</Text>
        </View>

        <Text style={styles.name}>{user?.name || 'Nhân viên phục vụ'}</Text>
        <Text style={styles.role}>Vai trò: {user?.role || 'WAITER'}</Text>
        <Text style={styles.phone}>SĐT: {user?.phone || '0901234567'}</Text>

        <TouchableOpacity style={styles.btnLogout} onPress={logout}>
          <Text style={styles.btnLogoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  role: {
    color: theme.colors.primary,
    fontSize: 14,
    marginTop: 4,
  },
  phone: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  btnLogout: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.error,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  btnLogoutText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
})
