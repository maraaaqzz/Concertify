import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { images } from '../constants';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB } from '../services/firebaseConfig';

export default function ChatItem({ item, router }) {
  const [lastMessage, setLastMessage] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState('');

  useEffect(() => {
    const fetchLastMessage = () => {
      const messagesQuery = query(
        collection(FIRESTORE_DB, 'rooms', item.roomId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      // Listen to real-time updates
      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const messageData = querySnapshot.docs[0].data();
          setLastMessage(messageData.text);

          const timestamp = messageData.createdAt?.toDate();
          setLastMessageTime(
            timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          );
        }
      });

      return unsubscribe; // Clean up the listener when the component unmounts
    };

    const unsubscribe = fetchLastMessage();
    return () => unsubscribe();
  }, [item.roomId]);

  const openChatRoom = () => {
    router.push({
      pathname: '/(user)/chatRoom',
      params: {
        roomId: item.roomId,
        username: item.username,
        profileImage: item.profileImage,
      },
    });
  };

  return (
    <TouchableOpacity onPress={openChatRoom} style={styles.item}>
      {item.profileImage ? (
        <Image source={{ uri: item?.profileImage }} style={styles.profileImage} />
      ) : (
        <Image source={images.profilepic} style={styles.profileImage} />
      )}
      {/* name and last message */}
      <View style={{ flex: 1, gap: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.text}>{item?.username}</Text>
          <Text style={styles.textMessage}>{lastMessageTime}</Text>
        </View>
        <Text style={styles.textMessage}>{lastMessage || 'No messages yet'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#1A1A1D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 7,
    marginBottom: 10,
    padding: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    gap: 3,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  textMessage: {
    color: 'white',
    fontSize: 13,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 4,
    borderColor: '#5B4E75',
  },
});
