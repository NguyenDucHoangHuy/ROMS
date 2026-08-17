import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LoginScreen } from '@/screens/auth/LoginScreen'
import { ROUTES } from '@/constants/routes'

const Stack = createNativeStackNavigator()

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />
    </Stack.Navigator>
  )
}
