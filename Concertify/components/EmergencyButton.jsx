import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useGlobalContext } from '../app/GlobalContext';
import { images } from '../constants';

const FloatingButton = () => {
  const { state, updateEm } = useGlobalContext();

  if (!state.activeConcert) return null;
  
  const handleEmergencyPress = () => {
    updateEm(true);
  };

  return (
    <View style={styles.floatingContainer}>
      <TouchableOpacity style={styles.floatingButton} onPress={handleEmergencyPress}>
        <Image style={{ width: 50, height: 50 }} source={images.emergency} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 180,
    right: -10,
    zIndex: 1000,
  },
  floatingButton: {
    padding: 15,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default FloatingButton;
