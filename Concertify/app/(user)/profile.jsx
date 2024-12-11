import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { images } from "../../constants";
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {requestMediaLibraryPermissionsAsync , launchImageLibraryAsync } from 'expo-image-picker'

const Profile = () => {
  const [enterText, setEnterText] = useState(false);
  const [aboutMe, setAboutMe] = useState("");
  const [favoriteArtists, setFavoriteArtists] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [concertsAttended, setConcertsAttended] = useState(0);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const [user, setUser] = useState(null);

  const selectImage = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.5,
    });
    //console.log(result);

    if (!result.canceled) {
      //console.log(result.assets[0].uri);
      await uploadToCloudinary(result.assets[0].uri); // Upload to Cloudinary
    }
  };

  const uploadToCloudinary = async (imageuri) => {
    try {
      // Ensure we are passing a valid URI
      console.log("Uploading image with URI:", imageuri);
  
      const formData = new FormData();
  
      // Append the file to the FormData
      formData.append('file', {
        uri: imageuri,
        type: 'image/*',
        name: 'profilsade_picture.jpg',
      });
  
      // Append required Cloudinary parameters
      formData.append('upload_preset', 'profile_picture');
      formData.append('cloud_name', 'dwfgosr2l');
  
      // Perform the fetch request
      const response = await fetch('https://api.cloudinary.com/v1_1/dwfgosr2l/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        //Save the Cloudinary URL to Firestore
        const userDoc = doc(FIRESTORE_DB, 'users', user.uid);
        await updateDoc(userDoc, { profileImage: result.secure_url });
        setProfilePicture(result.secure_url);
      } else {
        console.error('Cloudinary Upload Failed:', result.error.message);
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
    }
  };

  //for sobmitting changes made in profile
  const submitEdit = async () => {
    const userDoc = doc(FIRESTORE_DB, 'users', user.uid);
    try{
      console.log(aboutMe);
      await updateDoc(userDoc, {
        about: aboutMe,
        favArtists: favoriteArtists
      });
      setEnterText(false);
    } catch (error) { 
      console.error("Error submitting user data:", error);
    }
  }
  
  //this function signs out the user
  const signOutUser = async () => {
    try {
        await FIREBASE_AUTH.signOut();
        router.dismissAll();
        router.replace('/home');
    } catch (e) {
        console.log(e);
    }
  }

  const fetchData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
        setConcertsAttended(userDoc.data().concerts.length);
        if(userDoc.data().profileImage){
          setProfilePicture(userDoc.data().profileImage)
        } else {
          setProfilePicture(images.profilepic);
        }
        if(userDoc.data().about){
          setAboutMe(userDoc.data().about)
        } else {
          setAboutMe("Tell us something about you...")
        }
        if(userDoc.data().favArtists){
          setFavoriteArtists(userDoc.data().favArtists);
        } else {
          setFavoriteArtists("Tell us your favourite artists...");
        }
      } else {
        console.log('No such user!');
      }
    } catch (error) {
      console.error('Error fetching username: ', error);
    }
  }; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (curruser) => {
      if (curruser) {
        fetchData(curruser.uid);
        setUser(curruser);
      } 
    });
    return unsubscribe;
  }, []);

  return (
    <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperContainer}>
            { !enterText ?
              ( 
                <>
                  
                  <Image 
                      source={profilePicture ? { uri: profilePicture } : images.profilepic}
                      style={styles.profileImage}
                  />
                </>
              ) :
              (
                <>
                <Text style={styles.infoText}>Change your profile information by clicking each item you want to change</Text>
                  <TouchableOpacity onPress={selectImage}>
                    <Image 
                        source={profilePicture ? { uri: profilePicture } : images.profilepic}
                        style={styles.profileImage}
                    />
                  </TouchableOpacity>
                </>
              )
            }
            <Text style={styles.userName}> { `${username}`}</Text>
        </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex : 1}}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* About Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TextInput
            editable={enterText}
            style={styles.input}
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
          />
        </View>

        {/* Favorite Artists Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Artists</Text>
          <TextInput
            editable={enterText}
            style={styles.input}
            value={favoriteArtists}
            onChangeText={setFavoriteArtists}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concerts Attended</Text>
          <Text style={styles.concertCount}>{concertsAttended}</Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.buttons}>
      { !enterText ?
      (
        <>
            {/* Edit Profile Button */}
            <TouchableOpacity style={styles.editButton} onPress={() => {setEnterText(true)}}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
        </>
      ) :
      (
        <>
            {/* Edit Profile Button */}
            <TouchableOpacity style={styles.editButton} onPress={submitEdit}>
              <Text style={styles.editButtonText}>Submit</Text>
            </TouchableOpacity>
        </>
      )
      }
        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoText: {
    color: '#eee',
    textAlign: 'center',
    marginBottom: 15,
    marginHorizontal: 50,
  },
  upperContainer:{
    margin: 30,
    alignItems: 'center',
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
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 10,
    borderColor: '#5B4E75',
  },
  userName: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign:'center',
  },
  section: {
    backgroundColor: '#1e1e2d',
    padding: 20,
    marginVertical: 10,
    borderRadius: 25,
    marginHorizontal: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  editButton: {
    backgroundColor: '#3A3D4E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
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
    borderRadius: 25,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Profile;
