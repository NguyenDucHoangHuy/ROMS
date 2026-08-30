import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Utensils, BookOpen, FileText, Bell } from 'lucide-react-native';
import { theme } from '@/theme';
import { ROUTES } from '@/constants/routes';

import { TableMapScreen } from '@/screens/tables/TableMapScreen';
import { CreateOrderScreen } from '@/screens/order/CreateOrderScreen';
import { ActiveOrdersScreen } from '@/screens/orders/ActiveOrdersScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const renderIcon = (color: string) => {
          switch (route.name) {
            case ROUTES.TABS.TABLE_MAP:
              return <Utensils size={20} color={color} />;
            case 'MenuTab':
              return <BookOpen size={20} color={color} />;
            case 'OrdersTab':
              return (
                <View style={styles.iconBadgeWrap}>
                  <FileText size={20} color={color} />
                  <View style={styles.dotBadge} />
                </View>
              );
            case ROUTES.TABS.NOTIFICATIONS:
              return <Bell size={20} color={color} />;
            default:
              return <Utensils size={20} color={color} />;
          }
        };

        if (isFocused) {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.activeTabPill}
              onPress={onPress}
              activeOpacity={0.9}
            >
              {renderIcon(theme.colors.textOnPrimary)}
              <Text style={styles.activeTabText}>{label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.inactiveTabBtn}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {renderIcon(theme.colors.tabInactive)}
            <Text style={styles.inactiveTabText}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const WaiterTab = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name={ROUTES.TABS.TABLE_MAP}
        component={TableMapScreen}
        options={{ tabBarLabel: 'Tables' }}
      />
      <Tab.Screen
        name="MenuTab"
        component={CreateOrderScreen}
        options={{ tabBarLabel: 'Menu' }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={ActiveOrdersScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name={ROUTES.TABS.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 72,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  activeTabPill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    gap: 3,
    ...theme.shadow.sm,
  },
  activeTabText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  inactiveTabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingVertical: 6,
    gap: 3,
  },
  inactiveTabText: {
    color: theme.colors.tabInactive,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  iconBadgeWrap: {
    position: 'relative',
  },
  dotBadge: {
    position: 'absolute',
    top: -2,
    right: -5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
});