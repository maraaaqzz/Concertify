import { View, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { icons } from '../constants'; 
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
        style={styles.input}
        value={query}
        placeholder="Search by name or artist"
        placeholderTextColor="#aaa"
        onChangeText={(text) => setQuery(text)}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Image source={icons.search} style={styles.searchIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0, 
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#81BFDA',
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default SearchInput;
