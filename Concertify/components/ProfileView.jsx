import React from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import PropTypes from 'prop-types';

const screenHeight = Dimensions.get('window').height;
const SHEET_HEIGHT = screenHeight * 0.45; 

const ProfileView = ({
  selectedUser,
  mutualConcertsCount,
  translateY,
  closeProfileView,
  handleMessage,
}) => {
  return (
    <Animated.View
      style={[styles.profileView, { transform: [{ translateY }] }]}
    >
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButtonX}
        onPress={closeProfileView}
        accessible={true}
        accessibilityLabel="Close profile view"
        accessibilityRole="button"
      >
        <Text style={styles.closeButtonXText}>✕</Text>
      </TouchableOpacity>

      {/* Profile Content */}
      <Image
        source={{ uri: selectedUser.profileImage }}
        style={styles.profilePictureLarge}
      />
      <Text style={styles.profileName}>{selectedUser.name}</Text>
      <Text style={styles.profileUserName}>{selectedUser.username}</Text>
      <Text style={styles.mutualConcerts}>
        {mutualConcertsCount} Mutual {mutualConcertsCount === 1 ? "Concert" : "Concerts"}
      </Text> 

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        {/* Message Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.dmButton}
            onPress={() => {
              handleMessage(selectedUser);
            }}
          >
            <AntDesign name="message1" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonText}>Message</Text>
        </View>

        {/* View Profile Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.dmButton}
            onPress={() => {/* TO DO: implement profile view */}}
          >
            <AntDesign name="user" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonText}>View Profile</Text>
        </View>
      </View>
    </Animated.View>
  );
};

ProfileView.propTypes = {
  selectedUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    profileImage: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    concerts: PropTypes.array,
  }).isRequired,
  mutualConcertsCount: PropTypes.number.isRequired,
  translateY: PropTypes.object.isRequired,
  closeProfileView: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  profileView: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: SHEET_HEIGHT,
    backgroundColor: 'rgb(20, 20, 20)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'left', 
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 2,
  },
  closeButtonX: {
    position: 'absolute',
    top: 15,
    right: 20,
    zIndex: 3,
    padding: 10,
  },
  closeButtonXText: {
    fontSize: 24,
    color: '#fff',
  },
  profilePictureLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 11,
    borderColor: '#5B4E75',
    borderWidth: 5,
  },
  profileName: {
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 2,
  },
  profileUserName: {
    fontSize: 15,
    color: 'rgb(166, 164, 164)',
    marginLeft: 20,
    marginBottom: 14,
  },
  mutualConcerts: {
    fontSize: 14,
    color: 'rgb(99, 99, 99)',
    marginLeft: 20,
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmButton: {
    backgroundColor: '#5B4E75',
    padding: 15,
    borderRadius: 40, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: 60,
    height: 60, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    marginTop: 8, 
    color: 'rgb(166, 164, 164)',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default ProfileView;
