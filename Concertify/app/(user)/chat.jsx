import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Image, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth'; 
import { getDoc, doc, getDocs, collection, query, where } from 'firebase/firestore'; 
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../services/firebaseConfig'; 
import ChatList from '../../components/ChatList';

const Chat = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [users, setUsers] = useState([]);
  const userId = FIREBASE_AUTH.currentUser?.uid; 

  useEffect(() => {
    if (userId) {
      getUsers(); 
    }
  }, [userId]); 

  const getUsers = async () => {
    try {
      const q = query(collection(FIRESTORE_DB, "users"), where('userId', '!=', userId));
      const querySnapshot = await getDocs(q);
      let data = [];
      querySnapshot.forEach(doc => {
        data.push(doc.data()); 
      });
      setUsers(data); 
      //console.log('Got users: ', data); 
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

  // Function to fetch the profile image of the current user
  const fetchProfileImage = async () => {
    try {
      const auth = getAuth(); 
      const currentUserId = auth.currentUser?.uid;

      if (currentUserId) {
        const userDocRef = doc(FIRESTORE_DB, 'users', currentUserId); 
        const userDoc = await getDoc(userDocRef); 

        if (userDoc.exists()) {
          setProfileImage(userDoc.data().profileImage); 
        } else {
          console.log('User document not found.');
        }
      } else {
        console.log('No user is logged in.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchProfileImage(); 
  }, []); 

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chat</Text>
            {profileImage && (
              <Image source={{ uri: String(profileImage) }} style={styles.profileImage} />
            )}
          </View>

          {/* Users list */}
          <StatusBar style="light" />
          {users.length > 0 ? (
            <ChatList users={users} />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}

        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chat;
