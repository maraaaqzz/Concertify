import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ChatRoomHeader from "../../components/ChatRoomHeader";
import MessageList from "../../components/MessageList";
import { FIRESTORE_DB } from "../../services/firebaseConfig";
import { addDoc, collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { useGlobalContext } from "../app/../GlobalContext";

export default function ChatRoom() {
  const { roomId, username, profileImage } = useLocalSearchParams(); // Retrieve `roomId` from params
  const { state } = useGlobalContext(); // Access global user state
  const [messages, setMessages] = useState([]);
  const textRef = useRef("");
  const inputRef = useRef(null);

  // Fetch messages for the existing room
  useEffect(() => {
    if (state.user?.uid && roomId) {
      const messagesRef = collection(FIRESTORE_DB, "rooms", roomId, "messages");
      const q = query(messagesRef, orderBy("createdAt", "asc"));

      const unsub = onSnapshot(q, (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => doc.data());
        setMessages(allMessages);
      });

      return unsub;
    }
  }, [state.user?.uid, roomId]);

  const handleSendMessage = async () => {
    const message = textRef.current.trim();
    if (!message) return;

    try {
      const messagesRef = collection(FIRESTORE_DB, "rooms", roomId, "messages");
      textRef.current = "";
      inputRef.current?.clear();

      await addDoc(messagesRef, {
        userId: state.user.uid,
        text: message,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      Alert.alert("Message Error", err.message);
    }
  };

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={styles.container}>
      <ChatRoomHeader user={{ username, profileImage }} router={router} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <MessageList messages={messages} currentUser={state.user?.uid} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              onChangeText={(value) => (textRef.current = value)}
              placeholder="Type message..."
              placeholderTextColor="#fff"
              style={styles.textInput}
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Ionicons name="send-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1F",
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    color: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sendButton: {
    backgroundColor: "#621e62",
    padding: 10,
    borderRadius: 25,
    marginLeft: 8,
  },
});
