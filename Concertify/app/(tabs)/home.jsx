import { View, Text, FlatList, Image, TouchableOpacity, ScrollView  } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images }  from "../../constants";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter, router } from 'expo-router'; 
import { LinearGradient } from "expo-linear-gradient";
import { SectionContainer } from "../../components/SectionContainer";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from '../../services/firebaseConfig';

const HomeTab = () => {
  //this function lets the user acces the profile if they are logged in
  const goToSignInIfLoggedOut = () =>{
    //this verifies if user is logged in
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        const uid = user.uid;
        router.push('/profile'); //if user is logged in we go to profile
      } else {
        router.push('/login'); // if user is logged out we go to login
      }
    });
  }

  const router = useRouter();

  const topConcerts = [
    { name: "Lana Del Rey", image: images.lanaDelRey, imageKey: 'lanaDelRey' },
    { name: "Billie Eilish", image: images.billie, imageKey: 'billie' },
    { name: "Random", image: images.concert, imageKey: 'concert' },
  ];

  const upcomingConcerts = [
    { name: "Arctic Monkeys", image: images.am, imageKey: 'am' },
    { name: "The Weeknd", image: images.wknd, imageKey: 'wknd' },
    { name: "Random", image: images.concert, imageKey: 'concert' },
  ];

  const greetingMessage = () => {
    const currentTime = new Date().getHours();
    if (currentTime < 12) {
      return "Good Morning";
    } else if (currentTime < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };
  const message = greetingMessage();

  return (
    <LinearGradient 
      colors={['#040306', '#131624']}
      style={{ flex: 1 }} 
    >
      <SafeAreaView className="flex my-6 px-4 space-y-6">
          <View className="flex justify-between items-start flex-row mb-6">
              <Text className="text-2xl font-bold text-white" style={{ marginTop: 3, marginHorizontal: 15 }}>
                  {message}, Mara 
              </Text>
            
              <View >
                <TouchableOpacity onPress={goToSignInIfLoggedOut} style={{ marginBottom: 5, marginRight: 15}} > 
                  <MaterialCommunityIcons
                    name="account-circle" 
                    size={30}
                    color="white"
                  />
                  </TouchableOpacity>
              </View>
          </View>
      
          <View>
            <SectionContainer title="Your Concerts" data={topConcerts} />
          </View>
          <View >
            <SectionContainer title="Upcoming Live" data={upcomingConcerts} />
          </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

export default HomeTab