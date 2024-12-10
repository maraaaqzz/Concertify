import React from 'react'
import { Stack, SplashScreen } from 'expo-router'

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  return (
    <Stack >
      <Stack.Screen 
        name="concert" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="login" 
        options={{headerShown: false}} />
      <Stack.Screen 
        name="profile" 
        options={{ headerShown: false }} 
      />
    </Stack>
  )
}

export default RootLayout
