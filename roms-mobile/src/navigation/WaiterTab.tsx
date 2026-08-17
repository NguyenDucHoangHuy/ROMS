import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TableMapScreen } from '@/screens/tables/TableMapScreen'
import { CreateOrderScreen } from '@/screens/order/CreateOrderScreen'
import { ShiftCheckInScreen } from '@/screens/attendance/ShiftCheckInScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { ROUTES } from '@/constants/routes'
import { theme } from '@/theme'
import { LayoutGrid, UtensilsCrossed, MapPin, User } from 'lucide-react-native'

const Tab = createBottomTabNavigator()

export const WaiterTab = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen
        name={ROUTES.TABS.TABLE_MAP}
        component={TableMapScreen}
        options={{
          tabBarLabel: 'Sơ đồ bàn',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.CREATE_ORDER}
        component={CreateOrderScreen}
        options={{
          tabBarLabel: 'Gọi món hộ',
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.ATTENDANCE}
        component={ShiftCheckInScreen}
        options={{
          tabBarLabel: 'Điểm danh',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}
