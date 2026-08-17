import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native'
import { useGPSLocation } from '@/hooks/useGPSLocation'
import { theme } from '@/theme'

export const ShiftCheckInScreen = () => {
  const { location, errorMsg, isLoading, refreshLocation } = useGPSLocation()

  const handleCheckIn = () => {
    if (location) {
      alert(`Điểm danh thành công!\nTọa độ: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Điểm danh ca làm việc</Text>
        <Text style={styles.subtitle}>Xác thực vị trí GPS tại nhà hàng</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vị trí GPS hiện tại</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : location ? (
            <View style={styles.locationContainer}>
              <Text style={styles.coordsLabel}>Kinh độ (Lat): <Text style={styles.coordsValue}>{location.latitude}</Text></Text>
              <Text style={styles.coordsLabel}>Vĩ độ (Long): <Text style={styles.coordsValue}>{location.longitude}</Text></Text>
              <Text style={styles.statusSuccess}>✓ Đang ở phạm vi nhà hàng</Text>
            </View>
          ) : (
            <Text style={styles.infoText}>Chưa lấy được tọa độ</Text>
          )}

          <TouchableOpacity style={styles.btnRefresh} onPress={refreshLocation}>
            <Text style={styles.btnRefreshText}>Cập nhật lại GPS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btnCheckIn, (!location || isLoading) && styles.btnDisabled]}
          onPress={handleCheckIn}
          disabled={!location || isLoading}
        >
          <Text style={styles.btnCheckInText}>BẤM ĐIỂM DANH CA</Text>
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
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  loader: {
    marginVertical: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginVertical: theme.spacing.md,
  },
  infoText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginVertical: theme.spacing.md,
  },
  locationContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  coordsLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  coordsValue: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  statusSuccess: {
    color: theme.colors.available,
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  btnRefresh: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  btnRefreshText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  btnCheckIn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: 'auto',
  },
  btnDisabled: {
    backgroundColor: theme.colors.card,
    opacity: 0.5,
  },
  btnCheckInText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
