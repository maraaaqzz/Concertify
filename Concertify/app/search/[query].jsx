import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../services/firebaseConfig.jsx';
import { router } from 'expo-router';
import SearchInput from '../../components/SearchInput';
import Fuse from 'fuse';
import { LinearGradient } from 'expo-linear-gradient';

const Search = () => {
  const { query } = useLocalSearchParams();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFilteredConcerts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(FIRESTORE_DB, 'concerts'));
      const allConcerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const fuse = new Fuse(allConcerts, {
        keys: ['name', 'artist'],
        threshold: 0.4,
      });
      const filteredResults = fuse.search(query || '');
      const filteredConcerts = filteredResults.map((result) => result.item);

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
      onPress={() =>
        router.push({
          pathname: '/concert',
          params: { concertId: item.id },
        })
      }
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
    <LinearGradient
      colors={['#131324', '#252950', '#040306']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>Search results for</Text>
        <Text style={styles.queryText}>&quot;{query}&quot;</Text>
        <SearchInput />
        {loading ? (
          <ActivityIndicator size="large" color="#cd548d" style={styles.loading} />
        ) : (
          <FlatList
            data={concerts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RenderConcertItem item={item} />}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  container: {
    flex: 1,
  },
  headerText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  queryText: {
    fontSize: 18,
    color: '#80C4E9',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  concertCard: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  concertImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 8,
  },
  concertDetails: {
    flex: 1,
    padding: 12,
  },
  concertArtist: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  concertName: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  noResultsText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Search;
