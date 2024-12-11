import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function ChatRoomHeader({ user, router }) {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back-outline" size={29} color="white" />
      </TouchableOpacity>
      <View style={styles.userInfo}>
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="white" />
        )}
        <Text style={styles.usernameText}>{user?.username}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginTop: 20
  },
  backButton: {
    marginRight: 10, 

  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Corrected for an even circle
  },
  usernameText: {
    marginLeft: 10, // Space between the profile picture and the username
    fontSize: 18,
    color: 'white', // To ensure visibility on dark backgrounds
  },
});
