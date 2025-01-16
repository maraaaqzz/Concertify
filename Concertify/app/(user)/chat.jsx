import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getDoc, doc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig';
import ChatList from '../../components/ChatList';

const Chat = () => {
  const [profileImage, setProfileImage] = useState(null);
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        if (userId) {
          const userDocRef = doc(FIRESTORE_DB, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setProfileImage(userDoc.data()?.profileImage || null);
          } else {
            console.log('User document not found.');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileImage();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chats</Text>
            {profileImage ? (
              <Image source={{ uri: String(profileImage) }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>

          {/* Chat List */}
          <StatusBar style="light" />
          <ChatList loggedInUserId={userId} />
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
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Chat;
