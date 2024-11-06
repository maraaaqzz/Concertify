import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { Text, TextInput, View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { images } from "../constants";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 

const Profile = () => {
  const router = useRouter();

  const navigateToLogIn = () => {
    router.push('/login'); 
  };

  return (
    <LinearGradient 
      colors={['#040306', '#131624']}
      style={{ flex: 1 }} 
    >
      <TouchableOpacity onPress={navigateToLogIn} 
        style={{ marginLeft: 200, marginRight: 15, marginTop: 300}} > 
        <MaterialCommunityIcons
          name="account-circle" 
          size={30}
          color="white"

        />
      </TouchableOpacity>
    </LinearGradient>
  )
}

export default Profile