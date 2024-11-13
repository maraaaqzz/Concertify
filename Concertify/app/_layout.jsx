import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Stack, SplashScreen } from 'expo-router'
import "../global.css";

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const commonHeaderOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitleAlign: 'left',
  headerTitleStyle: styles.headerTitle,
  headerTintColor: '#FFFFFF', // Arrow color
};

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
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{headerShown: false}} />
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="comments" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(user)" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
       name="home"
       options={{ headerShown: false }}
      />
    </Stack>
  )
}

export default RootLayout
