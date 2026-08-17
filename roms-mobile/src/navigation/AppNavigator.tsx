import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthStack } from './AuthStack'
import { WaiterTab } from './WaiterTab'
import { ROUTES } from '@/constants/routes'
import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore'

const Stack = createNativeStackNavigator()

export const AppNavigator = () => {
  const { isAuthenticated, loadStoredAuth } = useWaiterAuthStore()

  useEffect(() => {
    loadStoredAuth()
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name={ROUTES.MAIN_TAB} component={WaiterTab} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
