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
          <Image source={{ uri: String(user.profileImage) }} style={styles.profileImage} />
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
    paddingTop: 50,
    paddingBottom:15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor:'#1A1A1D',
  },
  backButton: {
    marginRight: 10, 
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30, 
    borderWidth: 4,
    borderColor: '#5B4E75',
  },
  usernameText: {
    marginLeft: 10, 
    fontSize: 18,
    color: 'white', 
  },
});
