import { View, Text, StyleSheet, FlatList } from 'react-native';
import React, { useState, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { FIRESTORE_DB } from '../services/firebaseConfig';
import ChatItem from './ChatItem';
import { useRouter, useFocusEffect } from 'expo-router';

export default function ChatList({ loggedInUserId }) {
  const [rooms, setRooms] = useState([]);
  const router = useRouter();

  const fetchRooms = async () => {
    try {
      const roomsQuery = query(
        collection(FIRESTORE_DB, 'rooms'),
        where('participants', 'array-contains', loggedInUserId)
      );

      const querySnapshot = await getDocs(roomsQuery);
      const chatRooms = [];

      for (const roomDoc of querySnapshot.docs) {
        const roomData = roomDoc.data();
        const participants = roomData.participants;

        // Fetch user data for the other participant
        const otherUserId = participants.find((id) => id !== loggedInUserId);
        const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', otherUserId));

        let lastMessageAt = null;
        if (userDoc.exists()) {
          // Fetch the latest message timestamp
          const messagesQuery = query(
            collection(FIRESTORE_DB, 'rooms', roomDoc.id, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );

          const messagesSnapshot = await getDocs(messagesQuery);
          if (!messagesSnapshot.empty) {
            const lastMessageData = messagesSnapshot.docs[0].data();
            lastMessageAt = lastMessageData.createdAt;
          }

          const userData = userDoc.data();
          chatRooms.push({
            ...roomData,
            roomId: roomDoc.id,
            username: userData.username,
            profileImage: userData.profileImage,
            lastMessageAt,
          });
        }
      }

      // Sort chatRooms by lastMessageAt in descending order
      chatRooms.sort((a, b) => {
        if (a.lastMessageAt && b.lastMessageAt) {
          return b.lastMessageAt.seconds - a.lastMessageAt.seconds;
        }
        return 0;
      });

      setRooms(chatRooms); // Update the state in the background
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  // Use `useFocusEffect` to fetch rooms whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [loggedInUserId])
  );

  if (rooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chats yet. Start a new conversation!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.roomId}
      renderItem={({ item }) => <ChatItem item={item} router={router} />}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  },
});
