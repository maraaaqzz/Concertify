import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SectionContainer } from '../components/SectionContainer';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import SearchInput from '../components/SearchInput'
import { useGlobalContext } from './GlobalContext'

const HomeTab = () => {
  const { state, updateUser, updateAuth } = useGlobalContext();
  const userId = FIREBASE_AUTH.currentUser?.uid;
  console.log("state: ", state);

  const [concerts, setConcerts] = useState([]);
  const [userConcerts, setUserConcerts] = useState([]);

  const navigateIfLoggedOut = (route) => {
    if(state.isAuth){
      router.push(route);
    } else {
      router.replace('./login');
    }
  };

  const fetchConcerts = async () => {
    try {
      const snapshot = await getDocs(collection(FIRESTORE_DB, 'concerts'));
      const concertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConcerts(concertsData);
    } catch (error) {
      
      console.error('Error fetching concerts: ', error);
    }
  };

  const setupUserConcertsListener = () => {
    if (!userId) return;

    const userDocRef = doc(FIRESTORE_DB, 'users', userId);
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const concertIds = docSnapshot.data().concerts || [];
        const userConcertsData = await Promise.all(
          concertIds.map(async (concertId) => {
            try {
              const concertDoc = await getDoc(doc(FIRESTORE_DB, 'concerts', concertId));
              return concertDoc.exists() ? { id: concertDoc.id, ...concertDoc.data() } : null;
            } catch (error) {
              console.error('Error fetching concert details: ', error);
              return null;
            }
          })
        );
        setUserConcerts(userConcertsData.filter(Boolean));
      } else {
        setUserConcerts([]);
      }
    });

    return unsubscribe;
  };

  const fetchUsername = async (uid) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', uid));
      if (userDoc.exists()) {
        updateUser({
          uid: uid,
          name: userDoc.data().name,
          username: userDoc.data().username,
        })
        console.log("user found");
      } else {
        console.log('No such user!');
      }
    } catch (error) {
      console.error('Error fetching username: ', error);
    }
  };

  const greetingMessage = () => {
    const currentTime = new Date().getHours();
    if (currentTime < 12) return 'Good Morning';
    if (currentTime < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        updateAuth(true);
        fetchUsername(userId);
        setupUserConcertsListener();
      } else {
        updateAuth(false);
        setUserConcerts([]);
      }
    });

    return unsubscribeAuth;
  }, [userId]);

  useEffect(() => {
    fetchConcerts();
  }, []);

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <SafeAreaView className="flex my-6 px-4 space-y-6">

        <View className="flex justify-between items-start flex-wrap flex-row mb-6">
          <TouchableOpacity onPress={() => navigateIfLoggedOut('./profile')} style={{ marginBottom: 5, marginRight: 5 }}>
            <MaterialCommunityIcons name="account-circle" size={30} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white" style={{ marginTop: 3, marginHorizontal: 5 }}>
            {greetingMessage()} {state.isAuth && state.user?.name ? `, ${state.user.name}` : ''}
          </Text>
          <TouchableOpacity onPress={() => navigateIfLoggedOut('./chat')}>
            <Ionicons name="chatbubble-ellipses" size={28} color="white" />
          </TouchableOpacity>
        </View>
        
        <SearchInput/>

        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Your Concerts</Text>
          </View>
          {state.isAuth ? (
            userConcerts.length > 0 ? (
              <SectionContainer data={userConcerts} />
            ) : (
              <View style={styles.addConcertsMessageContainer}>
                <Text style={styles.addConcertMessageText}>Check-in to concerts!</Text>
              </View>
            )
          ) : (
            <View style={styles.addConcertsMessageContainer}>
              <Text style={styles.addConcertMessageText}>Log-in to see your concerts!</Text>
            </View>
          )}
        </View>

        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Upcoming Concerts</Text>
          </View>
          <SectionContainer data={concerts} />
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  addConcertsMessageContainer: {
    backgroundColor: '#171B2C',
    paddingVertical: 10,
    paddingHorizontal: 70,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 40,
    marginTop: 20,
  },
  titleContainer: {
    backgroundColor: '#131624',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginHorizontal: 10,
    marginTop: 10,
  },
  titleText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  addConcertMessageText: {
    alignItems: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeTab;
