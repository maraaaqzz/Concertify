import { Text, View, ScrollView, Image, Animated, Easing } from "react-native";
import { Link, useRouter } from 'expo-router'; 
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import React, { useEffect, useRef } from "react";
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // For zoom-in effect
  const router = useRouter();

  //Fade-in and scale animations for the entrance effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, 
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bounce, // Add a bounce effect
        useNativeDriver: true,
      })
    ]).start(() => {
      router.replace('/home');
    });
  }, [fadeAnim, scaleAnim, router]);

  return (
    <LinearGradient
      colors={['#040306', '#131624']}
      style={{ flex: 1 }} 
    >
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
          <Animated.View 
            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
            className="w-full flex justify-center items-center min-h-[85vh] px-4">
            
            <Image
              source={images.logo}
              className="max-w-[350px] w-full h-[400px]"
              resizeMode="contain"
              
            />

            <Text className="text-5xl text-rose-100 font-light text-center">
              Concertify.
            </Text>

            <Animated.Text
              style={{ opacity: fadeAnim, marginTop: 10 }}
              className="text-2xl text-rose-50 font-thin"
            >
              Never Miss A Beat!
            </Animated.Text>
          </Animated.View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}
