import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect} from 'react';
import { icons } from '../constants'; 
import { usePathname, router } from 'expo-router';

const SearchInput = () => {
 
  const [isFocused, setIsFocused] = useState(false); 

  const pathname = usePathname()
  const [query,setQuery] = useState('')

  const handleSearch = () => {
    if (!query) {
      return Alert.alert('Missing query', "Please input something to search results across the database");
    }

    if (pathname.startsWith('/search')) {
      router.setParams({ query });
    } else {
      router.push(`/search/${query}`);
    }
    setQuery(''); 
  };

  return (
      <View
      className="flex-row space-x-4"
        style={[
          styles.inputContainer,
          { borderColor: isFocused ? '#bb8fbb' : '#ccc' },
        ]}
      >
        <TextInput
          style={{ flex: 1, fontSize: 16 }}
          value={query}
          placeholder="Search for a concert"
          placeholderTextColor="#020305"
          onChangeText={(e) => setQuery(e)}
          onFocus={() => setIsFocused(true)}   
          onBlur={() => setIsFocused(false)}    
        
        />

       <TouchableOpacity
          onPress={handleSearch}>
        <Image
          source={icons.search}
          className="w-5 h-5"
          resizeMode="contain"
        />
       </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 214, 235, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 17,
    marginLeft: 15, 
    marginRight: 20,
    height: 56,
  },
});

export default SearchInput;
