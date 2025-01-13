import { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import ChatItem from './ChatItem';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ChatList({ loggedInUserId }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('participants', 'array-contains', loggedInUserId)
      );

      const querySnapshot = await getDocs(roomsQuery);

      const filteredRooms = [];
      for (const roomDoc of querySnapshot.docs) {
        const roomData = roomDoc.data();
        const messagesSnapshot = await getDocs(collection(roomDoc.ref, 'messages'));
        if (!messagesSnapshot.empty) {
          filteredRooms.push({ ...roomData, roomId: roomDoc.id });
        }
      }

      setRooms(filteredRooms);
    };

    fetchRooms();
  }, [loggedInUserId]);

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
      renderItem={({ item }) => <ChatItem item={item} />}
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
