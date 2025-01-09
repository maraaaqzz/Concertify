import React, { useState, useRef } from 'react';
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  PanResponder,
} from 'react-native';
import PropTypes from 'prop-types';

const screenHeight = Dimensions.get('window').height;
const SHEET_HEIGHT = screenHeight * 0.3; // 30% of the screen

const UserList = ({
  isVisible = false,
  slideAnim = new Animated.Value(Dimensions.get('window').width),
  users = [],
  onClose = () => {},
}) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const profileSlideAnim = useRef(new Animated.Value(screenHeight)).current;

  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          closeProfileView();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleUserPress = (user) => {
    setSelectedUser(user);
    pan.setValue(0);
    Animated.timing(profileSlideAnim, {
      toValue: screenHeight * 0.60, 
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeProfileView = () => {
    Animated.timing(profileSlideAnim, {
      toValue: screenHeight, 
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSelectedUser(null);
    });
  };

  if (!isVisible) return null;

  return (
    <>
      {/*User List=*/}
      <Animated.View
        style={[
          styles.userListContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <Text style={styles.userListTitle}>Users</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleUserPress(item)}
              style={styles.userItem}
            >
              <Image
                source={{ uri: item.profileImage }}
                style={styles.profilePicture}
              />
              <Text style={styles.userName}>{item.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No users available</Text>
            </View>
          }
        />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>

      {/*Bottom Sheet*/}
      {selectedUser && (
        <Animated.View
          style={[
            styles.profileView,
            {
              transform: [
                { translateY: Animated.add(profileSlideAnim, pan) },
              ],
            },
          ]}
        >
          <View style={styles.handleBarContainer} {...panResponder.panHandlers}>
            <View style={styles.handleBar} />
          </View>

          <Image source={{ uri: selectedUser.profileImage }} style={styles.profilePictureLarge} />
          <Text style={styles.profileUserName}>{selectedUser.username}</Text>
          <TouchableOpacity style={styles.dmButton}>
            <Text style={styles.dmButtonText}>DM</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
};

UserList.propTypes = {
  isVisible: PropTypes.bool,
  slideAnim: PropTypes.object,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      profileImage: PropTypes.string.isRequired,
    })
  ),
  onClose: PropTypes.func,
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
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyListText: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
  },


  profileView: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: SHEET_HEIGHT,
    backgroundColor: '#1A1A1D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  handleBarContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },

  closeProfileView: {
    position: 'absolute',
    top: 10,
    right: 20,
    padding: 10,
  },
  closeProfileText: {
    color: '#fff',
    fontSize: 18,
  },

  profilePictureLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginTop: 20,
    marginBottom: 10,
    borderColor: '#5B4E75',
    borderWidth: 2,
  },
  profileUserName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dmButton: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#5B4E75',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dmIcon: {
    marginRight: 10, 
  },
  dmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserList;
