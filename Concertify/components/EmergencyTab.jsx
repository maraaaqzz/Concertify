import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGlobalContext } from '../app/GlobalContext';

const EmergencyTab = () => {
  const { state, updateEm } = useGlobalContext();


  console.log(state.isEmergency);
  return (
    <Modal
      visible={state.isEmergency}
      animationType="fade"
      transparent
      onRequestClose={()=>{updateEm(false)}}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Emergency Options</Text>
          {/* Add your emergency options here */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={()=>{updateEm(false)}}
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
    width: '80%',
    backgroundColor: '#131624',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#1DB954',
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
});

export default EmergencyTab;
