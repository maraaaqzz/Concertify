import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { SectionContainer } from "../components/SectionContainer";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';

const HomeTab = () => {
  const [name, setName] = useState('');
  const [concerts, setConcerts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userConcerts, setUserConcerts] = useState([]);
  const [userId, setUserId] = useState(null);

  const goToSignInIfLoggedOut = () => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        router.push('./profile');
      } else {
        //router.dismissAll();
        router.replace('./home');
        router.push('./login'); // if user is logged out we go to login
      }
    });
  }

  const fetchConcerts = async () => {
    try {
      const snapshot = await getDocs(collection(FIRESTORE_DB, 'concerts'));
      const concertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConcerts(concertsData);
    } catch (error) {
      console.error("Error fetching concerts: ", error);
    }
  };

  // listener is for the displayed list to update in real time
  const setupUserConcertsListener = () => {
    if (!userId) return;

    const userDocRef = doc(FIRESTORE_DB, 'users', userId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const concertIds = docSnapshot.data().concerts || []; 

        // only fetch data and update state, no writes allowed
        const fetchConcertDetails = async () => {
          const userConcertsData = [];
          for (const concertId of concertIds) {
            try {
              const concertDoc = await getDoc(doc(FIRESTORE_DB, 'concerts', concertId));
              if (concertDoc.exists()) {
                userConcertsData.push({ id: concertDoc.id, ...concertDoc.data() });
              }
            } catch (error) {
              console.error("Error fetching concert details: ", error);
            }
          }
          // update the state only, no write-back to the database
          setUserConcerts(userConcertsData);
        };

        fetchConcertDetails();
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
        setName(userDoc.data().name);
      } else {
        console.log('No such user!');
      }
    } catch (error) {
      console.error('Error fetching username: ', error);
    }
  };
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        fetchUsername(user.uid);
        setupUserConcertsListener(); // Set up listener for user's concerts
      } else {
        setIsAuthenticated(false);
        setName(''); // Clear username if logged out
        setUserConcerts([]); // Clear user concerts if logged out
        setUserId(null);
      }
    });

    return () => {
      unsubscribeAuth(); 
    };
  }, [userId]);

  useEffect(() => {
    fetchConcerts();
  }, []);

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
            {message} {isAuthenticated && `, ${name}`}
          </Text>
          <View>
            <TouchableOpacity onPress={goToSignInIfLoggedOut} style={{ marginBottom: 5, marginRight: 15 }} > 
              <MaterialCommunityIcons
                name="account-circle" 
                size={30}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Your Concerts</Text>
          </View>
          {isAuthenticated ? (
            userConcerts.length > 0 ? (
              <SectionContainer title="" data={userConcerts} />
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
}

const styles = StyleSheet.create({
  addConcertsMessageContainer:{
    backgroundColor: '#171B2C',
    paddingVertical: 10,
    paddingHorizontal: 70,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 40,
    marginTop: 20
  },
  titleContainer: {
    backgroundColor: "#131624",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginHorizontal: 10,
    marginTop: 10,
  },
  titleText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
  addConcertMessageText:{
    alignItems: 'center',
    fontSize: 16,
    color:'#fff',
    fontWeight: 'bold',
  }
})

export default HomeTab;
