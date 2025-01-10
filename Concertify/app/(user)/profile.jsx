import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { images } from "../../constants";
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestMediaLibraryPermissionsAsync, launchImageLibraryAsync } from 'expo-image-picker';
import Post from '../../components/Post';

const Profile = () => {
  const [isUserDetailsTab, setIsUserDetailsTab] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState("");
  const [favoriteArtists, setFavoriteArtists] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [concertsAttended, setConcertsAttended] = useState(0);
  const [username, setUsername] = useState("");
  const [userThreads, setUserThreads] = useState([]);
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const router = useRouter();

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || "");
        setConcertsAttended(data.concerts?.length || 0);
        setProfilePicture(data.profileImage || images.profilepic);
        setAboutMe(data.about || "Tell us something about you...");
        setFavoriteArtists(data.favArtists || "Tell us your favorite artists...");
      } else {
        console.error("User document not found!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserThreads = async (username) => {
    try {
      const concertsSnapshot = await getDocs(collection(FIRESTORE_DB, 'concerts'));
      const threads = [];
  
      const promises = concertsSnapshot.docs.map(async (concertDoc) => {
        const concertName = concertDoc.data().name;
        const threadsQuery = query(
          collection(concertDoc.ref, 'threads'),
          where('username', '==', username),
          orderBy('timestamp', 'desc')
        );
        const threadsSnapshot = await getDocs(threadsQuery);
        threadsSnapshot.forEach((doc) => {
          threads.push({ id: doc.id, concertName, ...doc.data() });
        });
      });
  
      await Promise.all(promises);
      console.log(threads); // Log fetched threads
      setUserThreads(threads);
      console.log("THreads:" ,threads);
    } catch (error) {
      console.error("Error fetching user threads:", error);
    }
  };

  const selectImage = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera roll permission is required!');
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', { uri: imageUri, type: 'image/*', name: 'profile_picture.jpg' });
      formData.append('upload_preset', 'profile_picture');
      formData.append('cloud_name', 'dwfgosr2l');

      const response = await fetch('https://api.cloudinary.com/v1_1/dwfgosr2l/image/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        await updateDoc(doc(FIRESTORE_DB, 'users', userId), { profileImage: result.secure_url });
        setProfilePicture(result.secure_url);
      } else {
        console.error("Error uploading to Cloudinary:", result.error.message);
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
    }
  };

  const submitEdit = async () => {
    try {
      await updateDoc(doc(FIRESTORE_DB, 'users', userId), {
        about: aboutMe,
        favArtists: favoriteArtists,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      router.replace('/home');
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
        fetchUserThreads(username);
      }
    });
    return unsubscribe;
  }, [username]);

  return (
    <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.upperContainer}>
          <TouchableOpacity onPress={isEditing ? selectImage : null}>
            <Image
              source={String(profilePicture).trim() ? { uri: profilePicture } : images.profilepic}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.userName}>{username}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setIsUserDetailsTab(true)}
            style={[styles.tab, isUserDetailsTab && styles.activeTab]}
          >
            <Text style={[styles.tabText, isUserDetailsTab && styles.activeTabText]}>User Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsUserDetailsTab(false)}
            style={[styles.tab, !isUserDetailsTab && styles.activeTab]}
          >
            <Text style={[styles.tabText, !isUserDetailsTab && styles.activeTabText]}>Posts</Text>
          </TouchableOpacity>
        </View>

        {isUserDetailsTab ? (
          <>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <TextInput
                  editable={isEditing}
                  style={styles.input}
                  value={aboutMe}
                  onChangeText={setAboutMe}
                />
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Favorite Artists</Text>
                <TextInput
                  editable={isEditing}
                  style={styles.input}
                  value={favoriteArtists}
                  onChangeText={setFavoriteArtists}
                />
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Concerts Attended</Text>
                <Text style={styles.concertCount}>{concertsAttended}</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View style={styles.buttons}>
          {isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={submitEdit}>
              <Text style={styles.editButtonText}>Submit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        </>
        ) : (
          <FlatList
            data={userThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return(
                <Post
                  item={item}
                  userId={userId}
                  showLike={false}
                  showCommentButton={false}
                  showProfile = {false}
                  containerStyle={{ marginHorizontal: 16, marginBottom: 10 }}
                />
              )
            }}
          />
        )}

        
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#A64D79', 
  },
  tabText: {
    fontSize: 18,
    color: '#999',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});

export default Profile;
