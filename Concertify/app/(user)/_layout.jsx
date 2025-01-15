import React from 'react'
import { Stack, SplashScreen } from 'expo-router'

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="comments" options={{ headerShown: false }} />
        <Stack.Screen name="(user)" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
        <Stack.Screen name="userList" options={{ headerShown: false }} />
      </Stack>
  )
}

export default RootLayout
