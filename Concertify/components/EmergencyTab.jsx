import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useGlobalContext } from '../app/GlobalContext';
import { FIRESTORE_DB } from '../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { images } from '../constants';

const EmergencyTab = () => {
  const { state, updateEm } = useGlobalContext();

  const uploadEmergency = async (type) => {
    try {
      const emergenciesRef = collection(FIRESTORE_DB, "concerts", state.activeConcert.id , 'emergencies');
      await addDoc(emergenciesRef, {
        type,
        user: state.user?.username || 'Anonymous',
        concertId: state.activeConcert?.id,
        time: new Date(),
      });
      updateEm(false);
      Alert.alert('Success', `Emergency "${type}" reported successfully.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to report the emergency.');
    }
  };

  const handleEmergencyPress = (type) => {
    Alert.alert(
      'Confirm Emergency',
      `Are you sure you want to report the "${type}" emergency?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => uploadEmergency(type) },
      ]
    );
  };

  return (
    <Modal
      visible={state.isEmergency}
      animationType="fade"
      transparent
      onRequestClose={() => updateEm(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={images.emergency} style={{ width: 50, height: 50 }} />
          <Text style={styles.modalTitle}>Emergency Options</Text>
          <ScrollView style={styles.scroll}>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleEmergencyPress('FEEL BAD')}
              >
                <Text style={styles.buttonText}>FEEL BAD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleEmergencyPress('NEED WATER')}
              >
                <Text style={styles.buttonText}>NEED WATER</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleEmergencyPress('LOST A FRIEND')}
              >
                <Text style={styles.buttonText}>LOST A FRIEND</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleEmergencyPress('GOT LOST')}
              >
                <Text style={styles.buttonText}>GOT LOST</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleEmergencyPress('OTHER')}
              >
                <Text style={styles.buttonText}>OTHER</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleEmergencyPress('OTHER')}
              >
                <Text style={styles.buttonText}>OTHER</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => updateEm(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#131624',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    height: '70%',
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#6A1E55',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scroll: {
    flex: 2,
    width: '100%',
    flexWrap: 'nowrap',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8C7B9D',
    borderRadius: 30,
    width: '47%',
    height: 110,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EmergencyTab;
