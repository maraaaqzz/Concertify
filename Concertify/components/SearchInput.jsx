import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect} from 'react';
import { icons } from '../constants'; // Ensure this is the correct import path for your icons
import { usePathname, router } from 'expo-router';

const SearchInput = () => {
  const [query, setQuery] = useState('');
  const pathname = usePathname();

  const handleSearch = () => {
    if (!query) {
      return Alert.alert('Missing query', 'Please input something to search.');
    }
    if (pathname.startsWith('/search')) {
      router.setParams({ query });
    } else {
      router.push(`/search/${query}`);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={{ flex: 1, fontSize: 16 }}
        value={query}
        placeholder="Search by name or artist"
        onChangeText={(text) => setQuery(text)}
      />
      <TouchableOpacity onPress={handleSearch}>
        <Image source={icons.search} style={{ width: 20, height: 20 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginVertical: 10,
  },
});

export default SearchInput;