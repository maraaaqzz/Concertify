import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../services/firebaseConfig.jsx';
import { router } from 'expo-router';
import SearchInput from '../../components/SearchInput';
import Fuse from 'fuse.js';

const Search = () => {
  const { query } = useLocalSearchParams();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFilteredConcerts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(FIRESTORE_DB, 'concerts'));
      const allConcerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const fuse = new Fuse(allConcerts, {
        keys: ['name', 'artist'],
        threshold: 0.4,
      });
      const filteredResults = fuse.search(query || '');
      const filteredConcerts = filteredResults.map(result => result.item);

      setConcerts(filteredConcerts);
    } catch (error) {
      console.error('Error fetching filtered concerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) fetchFilteredConcerts();
  }, [query]);

  const RenderConcertItem = ({ item }) => (
    <TouchableOpacity
      style={styles.concertCard}
      onPress={() => router.push({
        pathname: '/concert',
        params: {
          concertId: item.id,
          name: item.name,
          artist: item.artist,
          photoUrl: item.photoUrl,
        },
      })}
    >
      <Image
        source={{ uri: item.photoUrl || 'fallback_image_url' }}
        style={styles.concertImage}
        resizeMode="cover"
      />
      <View style={styles.concertDetails}>
        <Text style={styles.concertArtist}>{item.artist}</Text>
        <Text style={styles.concertName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Search results for</Text>
      <Text style={styles.queryText}>&quot;{query}&quot;</Text>
      <SearchInput
        value={query}
        placeholder="Search by name or artist"
        onChangeText={(text) => {
          setQuery(text);
        }}
      />
      <View style={{ marginVertical: 16 }} />
      {loading ? (
        <ActivityIndicator size="large" color="#cd548d" style={styles.loading} />
      ) : (
        <FlatList
          data={concerts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RenderConcertItem item={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 16,
    color: '#333',
   
  },
  queryText: {
    fontSize: 20,
    color: '#333',
    
    marginBottom: 10,
    marginTop: -10,
    marginLeft: 5,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  concertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    alignItems: 'center',
  },
  concertImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 8,
  },
  concertDetails: {
    flex: 1,
    padding: 8,
  },
  concertArtist: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  concertName: {
    fontSize: 14,
    color: '#555',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 32,
  
  },
});

export default Search;
