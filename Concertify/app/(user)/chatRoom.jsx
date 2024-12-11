import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 
import ChatRoomHeader from '../../components/ChatRoomHeader';
import MessageList from '../../components/MessageList';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../services/firebaseConfig'; 
import { addDoc, collection, onSnapshot, orderBy, query, Timestamp, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Import this for auth state listening

export default function ChatRoom() {
  const item = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // State to hold authenticated user
  const textRef = useRef('');
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setCurrentUser({ userId: user.uid });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      createRoomIfNotExists();
      const roomId = getRoomId(currentUser.userId, item?.userId);
      const docRef = doc(FIRESTORE_DB, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsub = onSnapshot(q, (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => doc.data());
        setMessages(allMessages);
      });

      return unsub;
    }
  }, [currentUser]);

  const getRoomId = (userId1, userId2) => {
    const sortedIds = [String(userId1), String(userId2)].sort();
    return sortedIds.join('_');
  };

  const createRoomIfNotExists = async () => {
    if (!currentUser) return;
    const roomId = getRoomId(currentUser.userId, item?.userId);
    try {
      await setDoc(doc(FIRESTORE_DB, "rooms", roomId), {
        roomId,
        createdAt: Timestamp.fromDate(new Date()),
      }, { merge: true });
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleSendMessage = async () => {
    const message = textRef.current.trim();
    if (!message) return;

    try {
      const roomId = getRoomId(currentUser.userId, item?.userId);
      const docRef = doc(FIRESTORE_DB, 'rooms', roomId);
      const messagesRef = collection(docRef, "messages");
      textRef.current = "";
      inputRef.current?.clear();

      await addDoc(messagesRef, {
        userId: currentUser.userId,
        text: message,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      Alert.alert('Message Error', err.message);
    }
  };

  return (
    <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
      <ChatRoomHeader user={item} router={router} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View className="h-1 border-b border-neutral-100" />
        <View />
        <View style={{ flex: 1 }}>
          <MessageList messages={messages} currentUser={currentUser} />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            onChangeText={(value) => (textRef.current = value)}
            placeholder="Type message..."
            placeholderTextColor="#aaa"
            style={styles.textInput}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    color: '#000',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sendButton: {
    backgroundColor: '#621e62',
    padding: 10,
    borderRadius: 25,
    marginLeft: 8,
  },
});
