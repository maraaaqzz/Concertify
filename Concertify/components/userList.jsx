// UserList.js
import React from 'react';
import { Animated, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { images } from '../constants';

const UserList = ({ isVisible, slideAnim, users, onClose }) => {

  return isVisible ? (
    <Animated.View style={[styles.userListContainer, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={styles.userListTitle}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Image source={{ uri: item.profileImage }} style={styles.profilePicture} />
            <Text style={styles.userName}>{item.username}</Text>
          </View>
        )}
      />
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </Animated.View>
  ) : null;
};

const styles = StyleSheet.create({
  userListContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '70%',
    backgroundColor: '#1A1A1D',
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  userListTitle: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 45,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  userName: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: '#5B4E75',
    borderWidth: 3,
    marginRight: 5,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#5B4E75',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserList;
