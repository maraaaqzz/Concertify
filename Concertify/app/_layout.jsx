import React, { useContext, useEffect } from 'react'
import { View } from 'react-native';
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from 'expo-router'
import "../global.css";
import GlobalProvider from './GlobalContext'
import FloatingButton from '../components/EmergencyButton'
import EmergencyTab from '../components/EmergencyTab'

SplashScreen.preventAutoHideAsync();


const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Montserrat-Italic-VariableFont": require("../assets/fonts/Montserrat-Italic-VariableFont_wght.ttf"),
    "Montserrat-VariableFont": require("../assets/fonts/Montserrat-VariableFont_wght.ttf")
  })


  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GlobalProvider>
      <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="comments" options={{ headerShown: false }} />
        <Stack.Screen name="(user)" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
        <Stack.Screen name="categoryConcerts" options={{ headerShown: false }} />
        <Stack.Screen name="genreConcerts" options={{ headerShown: false }} />
      </Stack>
      <FloatingButton/>
      <EmergencyTab/>
      </View>
    </GlobalProvider>
  
  )
}

export default RootLayout

