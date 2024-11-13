import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { images } from "../constants";
import { useRouter } from 'expo-router';

const Profile = () => {
  const [aboutMe, setAboutMe] = useState("");
  const [favoriteArtists, setFavoriteArtists] = useState("");
  const [concertsAttended, setConcertsAttended] = useState(0);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Mock fetch for concerts attended count
    setConcertsAttended(0); // Replace with database fetch
  }, []);
  
  //this function signs out the user
  const signOutUser = async () => {
    try {
        await FIREBASE_AUTH.signOut();
        router.dismissAll();
    } catch (e) {
        console.log(e);
    }
  }

  const fetchUsername = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
      } else {
        console.log('No such user!');
      }
    } catch (error) {
      console.error('Error fetching username: ', error);
    }
  }; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        fetchUsername(user.uid);
      } 
    });
    return unsubscribe;
  }, []);

  return (
    <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.coverContainer}>
            <View style={styles.coverImageContainer}>
                <Image 
                    source={images.crowd} 
                    style={styles.coverImage}
                />
                <LinearGradient 
                    colors={["transparent", "#040306"]}
                    style={styles.gradientOverlay}
                />
            </View>

            <View style={styles.profileImageContainer}>
                <Image 
                    source={images.profilepic}
                    style={styles.profileImage}
                />
            </View>
        </View>

        <View style={styles.userInfo}>
            <Text style={styles.userName}> { `${username}`}</Text>
        </View>

        {/* About Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TextInput
            style={styles.input}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#777"
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
          />
        </View>

        {/* Favorite Artists Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Artists</Text>
          <TextInput
            style={styles.input}
            placeholder="Add your favorite artists..."
            placeholderTextColor="#777"
            value={favoriteArtists}
            onChangeText={setFavoriteArtists}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concerts Attended</Text>
          <Text style={styles.concertCount}>{concertsAttended}</Text>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, 
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  gradientOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
  },
  profileImageContainer: {
    position: 'absolute',
    top: 300, 
    alignSelf: 'left',
    borderRadius: 50,
    overflow: 'hidden'
  },
  coverImageContainer: {
    width: '100%',
    height: 450,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    marginLeft: 40,
  },
  userName: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#1e1e2d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: -70, 
    marginBottom: 10,
    marginLeft: 70,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#555',
    paddingVertical: 5,
  },
  concertCount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#3A3D4E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#6A1E55',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Profile;
