import React, { useState } from 'react';
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import { onAuthStateChanged, signOut} from "firebase/auth";
import { FIREBASE_AUTH } from '../services/firebaseConfig';

const Profile = () => {
  const router = useRouter();
  
  //this function signs out the user
  signOutUser = async () => {
    try {
        await FIREBASE_AUTH.signOut();
        router.replace('../home')
    } catch (e) {
        console.log(e);
    }
  }
  return (
    <LinearGradient 
      colors={['#040306', '#131624']}
      style={{ flex: 1 }} 
    >
      <TouchableOpacity onPress={signOutUser} 
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