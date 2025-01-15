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
import AntDesign from '@expo/vector-icons/AntDesign';
import PropTypes from 'prop-types';
import ProfileView from './ProfileView'; 
import { useGlobalContext } from '../app/GlobalContext'; 
import { FIRESTORE_DB } from '../services/firebaseConfig';
import { query, collection, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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

  const handleMessage = async (selectedUser) => {
    try {
      console.log("handleMessage invoked with user:", selectedUser);
  
      const loggedInUserId = state.user.uid;
      const participantIds = [loggedInUserId, selectedUser.id].sort();
  
      console.log("Participants for chat:", participantIds);
  
      const roomsQuery = query(
        collection(FIRESTORE_DB, 'rooms'),
        where('participants', '==', participantIds)
      );
      const querySnapshot = await getDocs(roomsQuery);
  
      if (!querySnapshot.empty) {
        const existingRoom = querySnapshot.docs[0];
        console.log("Room exists. Redirecting to:", existingRoom.id);
        router.push({ pathname: '/chatRoom', params: { roomId: existingRoom.id } });
      } else {
        console.log("No room found. Creating new...");
        const newRoomRef = await addDoc(collection(FIRESTORE_DB, 'rooms'), {
          participants: participantIds,
          createdAt: serverTimestamp(),
        });
        console.log("New room created. Redirecting to:", newRoomRef.id);
        router.push({ pathname: '/chatRoom', params: { roomId: newRoomRef.id } }); //error here FIX
        console.log("succesfully redirected."); // it's not succesfully redirecting, router.push error
      }
    } catch (error) {
      console.error("Error in handleMessage:", error);
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
