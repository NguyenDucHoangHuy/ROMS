import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Bell,
  Utensils,
  Receipt,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ROUTES } from '@/constants/routes';
import { getSocketClient } from '@/services/socket';

interface NotificationItem {
  id: string;
  tableId?: string;
  tableNumber?: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: 'dish_ready' | 'order_opened' | 'general';
}

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Hệ thống sẵn sàng',
    desc: 'Chào mừng bạn đến với ca làm việc ROMS Waiter.',
    time: 'Vừa xong',
    unread: false,
    type: 'general',
  },
];

export const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFS);

  useEffect(() => {
    const socket = getSocketClient();

    const handleItemUpdate = (payload: any) => {
      if (payload?.status === 'READY') {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          tableId: payload.tableId,
          title: 'Món ăn đã nấu xong! 🍽️',
          desc: `Bếp đã chuẩn bị xong món. Vui lòng bưng ra phục vụ khách.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          type: 'dish_ready',
        };
        setNotifications((prev) => [newNotif, ...prev]);
      } else if (payload?.status === 'OPENED') {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          tableId: payload.tableId,
          title: 'Khách vừa Check-in nhận bàn! 🎉',
          desc: `Đã mở phiên ăn cho bàn. Nhân viên có thể vào phục vụ khách.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          type: 'order_opened',
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    };

    socket.on('order:item-updated', handleItemUpdate);
    return () => {
      socket.off('order:item-updated', handleItemUpdate);
    };
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationPress = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );

    if (notif.tableId) {
      navigation.navigate(ROUTES.STACKS.TABLE_DETAIL, {
        tableId: notif.tableId,
        tableNumber: notif.tableNumber || '',
      });
    }
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.colors.text} />
          <Text style={styles.headerTitle}>Thông báo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
          <CheckCheck size={16} color={theme.colors.primary} />
          <Text style={styles.markReadText}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <View style={styles.listWrapper}>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.notifCard, item.unread && styles.notifCardUnread]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconWrap,
                  item.type === 'dish_ready'
                    ? styles.iconWrapReady
                    : styles.iconWrapDefault,
                ]}
              >
                {item.type === 'dish_ready' ? (
                  <Utensils size={18} color="#15803D" />
                ) : (
                  <Bell size={18} color={theme.colors.primary} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.notifDesc}>{item.desc}</Text>
              </View>
              {item.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  scrollArea: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 },
  listWrapper: { gap: 10 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
    ...theme.shadow.sm,
  },
  notifCardUnread: {
    backgroundColor: '#FFFBF7',
    borderColor: theme.colors.occupiedBorder,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapReady: { backgroundColor: '#DCFCE7' },
  iconWrapDefault: { backgroundColor: theme.colors.primaryLight },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  timeText: { fontSize: 11, color: theme.colors.textMuted },
  notifDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
