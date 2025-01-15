// components/UserList.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Easing,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import ProfileView from '../components/ProfileView'; 
import { useGlobalContext } from './GlobalContext'; 
import { FIRESTORE_DB } from '../services/firebaseConfig';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router'; 

const screenHeight = Dimensions.get('window').height;
const SHEET_HEIGHT = screenHeight * 0.45; 

const UserList = ({
  isVisible = false,
  slideAnim,
  users = [],
  onClose = () => {},
  loggedInUserConcerts = [],
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false); 
  const [mutualConcertsCount, setMutualConcertsCount] = useState(0); // for mutual concerts count
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const isProfileOpen = useRef(false);

  const internalSlideAnim = useRef(slideAnim || new Animated.Value(Dimensions.get('window').width)).current;

  const { state } = useGlobalContext(); 

  const router = useRouter();

  const getRoomId = (userId1, userId2) => {
    return [String(userId1), String(userId2)].sort().join("_");
  };

  const handleMessage = async (selectedUser) => {
    const loggedInUserId = state.user.uid;
    const roomId = getRoomId(loggedInUserId, selectedUser.id);
  
    try {
      // Reference the room document
      const roomRef = doc(FIRESTORE_DB, "rooms", roomId);
  
      // Check if the room already exists
      const roomSnapshot = await getDoc(roomRef);
  
      if (!roomSnapshot.exists()) {
        // Room doesn't exist, create it
        console.log("Room does not exist. Creating new room...");
        await setDoc(roomRef, {
          roomId,
          participants: [loggedInUserId, selectedUser.id],
          createdAt: Timestamp.fromDate(new Date()),
        });
        console.log("New room created with ID:", roomId);
      } else {
        console.log("Room already exists with ID:", roomId);
      }
      router.push({ pathname: "/chat", 
          params: { 
          roomId: String(roomId),
          username: String(selectedUser.username),
          profileImage: selectedUser.profileImage ? String(selectedUser.profileImage) : ""
        } 
      });
    } catch (error) {
      console.error("Error handling message:", error);
      Alert.alert("Error", "Failed to start the chat. Please try again.");
    }
  };

  // Handle user press to open profile
  const handleUserPress = useCallback(
    (user) => {
      if (isAnimating || (isProfileOpen.current && selectedUser?.id === user.id)) return;

      setSelectedUser(user);
      isProfileOpen.current = true;

      // Calculate mutual concerts
      const mutualConcerts = user.concerts?.filter((concert) =>
        loggedInUserConcerts.includes(concert)
      ) || [];
      setMutualConcertsCount(mutualConcerts.length);

      setIsAnimating(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    },
    [isAnimating, selectedUser, loggedInUserConcerts, translateY]
  );

  const closeProfileView = useCallback(() => {
    if (isAnimating || !isProfileOpen.current) {
      console.log('No animation to close or already animating.');
      return;
    }
    isProfileOpen.current = false;
    setIsAnimating(true);

    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setSelectedUser(null);
      setIsAnimating(false);
    });
  }, [isAnimating, translateY]);

  useEffect(() => {
    if (!isVisible) {
      translateY.setValue(SHEET_HEIGHT);
      setSelectedUser(null);
      setIsAnimating(false);
      isProfileOpen.current = false;
    }
  }, [isVisible, translateY]);

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={() => {
        if (isProfileOpen.current) {
          closeProfileView();
        } else {
          onClose();
        }
      }}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <TouchableOpacity
          style={styles.viewOverlay}
          activeOpacity={1}
          onPress={() => {
            if (isProfileOpen.current) {
              closeProfileView();
            } else {
              onClose();
            }
          }}
        />

        {/* User List */}
        <Animated.View
          style={[
            styles.userListContainer,
            { transform: [{ translateX: internalSlideAnim }] },
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

        {/* Profile View */}
        {selectedUser && (
          <ProfileView
            selectedUser={selectedUser}
            mutualConcertsCount={mutualConcertsCount}
            translateY={translateY}
            closeProfileView={closeProfileView}
            handleMessage={handleMessage} // Pass handleMessage here
          />
        )}
      </View>
    </Modal>
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
      name: PropTypes.string.isRequired,
      concerts: PropTypes.array,
    })
  ),
  onClose: PropTypes.func,
  loggedInUserConcerts: PropTypes.array,
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  userListContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '70%',
    backgroundColor: 'rgb(25, 25, 25)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1,
  },
  userListTitle: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 45,
    textAlign: 'center', // Center the title
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
  viewOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.59)',
    zIndex: 0,
  },
});

export default UserList;
