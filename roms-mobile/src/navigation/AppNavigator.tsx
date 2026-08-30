import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthStack } from './AuthStack'
import { WaiterTab } from './WaiterTab'
import { ROUTES } from '@/constants/routes'
import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore'

// Stack screens accessible from inside WaiterTab
import { TableDetailScreen } from '@/screens/tables/TableDetailScreen'
import { CreateOrderScreen } from '@/screens/order/CreateOrderScreen'
import { OrderSummaryScreen } from '@/screens/order/OrderSummaryScreen'
import { ShiftCheckInScreen } from '@/screens/attendance/ShiftCheckInScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'

const RootStack = createNativeStackNavigator()

export const AppNavigator = () => {
  const { isAuthenticated, loadStoredAuth } = useWaiterAuthStore()

  useEffect(() => {
    loadStoredAuth()
  }, [])

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            {/* Main Tab */}
            <RootStack.Screen name={ROUTES.MAIN_TAB} component={WaiterTab} />
            {/* Stack screens pushed over tabs */}
            <RootStack.Screen
              name={ROUTES.STACKS.TABLE_DETAIL}
              component={TableDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <RootStack.Screen
              name={ROUTES.STACKS.CREATE_ORDER}
              component={CreateOrderScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <RootStack.Screen
              name={ROUTES.STACKS.ORDER_SUMMARY}
              component={OrderSummaryScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <RootStack.Screen
              name={ROUTES.STACKS.SHIFT_CHECK_IN}
              component={ShiftCheckInScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <RootStack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
