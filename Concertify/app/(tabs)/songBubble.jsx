import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { router, useGlobalSearchParams } from 'expo-router';

// Spotify OAuth Config
const CLIENT_ID = '4eb8e4c38a89447095e9dfa069ad49e6';
const REDIRECT_URI = makeRedirectUri({ useProxy: true });
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'playlist-read-private',
];

const discovery = {
  authorizationEndpoint: AUTH_ENDPOINT,
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

WebBrowser.maybeCompleteAuthSession();

const SongBubble = () => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const { concertId } = useGlobalSearchParams();

  const [accessToken, setAccessToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postedSong, setPostedSong] = useState(false);
  const [fetchedSongs, setFetchedSongs] = useState([]);
  const [username, setUsername] = useState('');

  // auth request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
      responseType: ResponseType.Token,
    },
    discovery
  );

  // save token with expiry time
  const saveAccessToken = async (token, expiresIn) => {
    if (!userId) return;
  
    const userRef = doc(FIRESTORE_DB, 'users', userId);
    const expiryTime = Date.now() + expiresIn * 1000;
  
    try {
      await updateDoc(userRef, { spotifyToken: token, spotifyTokenExpiry: expiryTime });
    } catch (error) {
      console.error('Error saving token to Firestore:', error);
    }
  };

  // get token from SecureStore
  const getAccessToken = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) return null;
  
    const userRef = doc(FIRESTORE_DB, 'users', userId);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.spotifyTokenExpiry && Date.now() < data.spotifyTokenExpiry) {
          return data.spotifyToken;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching token from Firestore:', error);
      return null;
    }
  };

  // Spotify OAuth response
  useEffect(() => {
    const initializeToken = async () => {
      const token = await getAccessToken();
      if (!token) {
        // trigger login if no valid token is found
        setAccessToken(null);
        return;
      }
      setAccessToken(token);
    };
  
    initializeToken();
  
    if (response?.type === 'success') {
      const { access_token, expires_in } = response.params;
      setAccessToken(access_token);
      saveAccessToken(access_token, expires_in); 
    }
  }, [response]);

  // Fetch songs posted in the concert and fetch current username

  useEffect(() => {
    const fetchUsername = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
        if (userDoc.exists()) {
          console.log(userDoc.data().username);
          setUsername(userDoc.data().username);
        }
      }
      else{
        console.log("error");
      }
    };
    fetchUsername();
  }, [userId]);

  useEffect(() => {
    try {
      const songsRef = query(
        collection(FIRESTORE_DB, 'concerts', concertId, 'songs'),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(songsRef, (querySnapshot) => {
        const songsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFetchedSongs(songsList);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching songs:', error);
      Alert.alert('Error', 'Unable to fetch posted songs.');
    }
  }, [postedSong, accessToken]);

  // search for songs
  const searchSpotify = async (query) => {
    if (!accessToken) {
      Alert.alert('No Access Token', 'Please log in first.');
      return;
    }
    if (query) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error Response:', errorText);
          Alert.alert('Spotify API Error', `Status: ${response.status}. Message: ${errorText}`);
          return;
        }
        const data = await response.json();
        setSearchResults(data.tracks?.items || []);
      } catch (error) {
        console.error('Error searching songs:', error);
        Alert.alert('Error', 'Unable to search for songs.');
      }
    }
  };

  // handle posting song to Firebase
  const handlePostSong = (track) => {
    const songDetails = {
      username: username,
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0].url,
      spotifyUrl: track.external_urls.spotify,
    };

    Alert.alert(
      'Post Song?',
      `${songDetails.title} by ${songDetails.artist}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Post', onPress: () => postSongToFirebase(songDetails) },
      ]
    );
  };

  const postSongToFirebase = async (songDetails) => {
    try {
      await addDoc(collection(FIRESTORE_DB, 'concerts', concertId, 'songs'), {
        userId,
        ...songDetails,
        timestamp: new Date(),
      });
      setPostedSong(true);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const openSpotifyLink = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Unable to open the Spotify link.');
    });
  };

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          <FlatList
            data={fetchedSongs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => openSpotifyLink(item.spotifyUrl)}>
                <View style={styles.postedSongItem}>
                  <View style={styles.postedMiniItem1}>
                    <Text style={styles.postedText}>{item.username}</Text>
                    <Text style={styles.postedText}>{new Date(item.timestamp.seconds * 1000).toLocaleTimeString()}</Text>
                  </View>
                  <View style={styles.postedMiniItem2}>
                    <Image source={{ uri: String(item.albumArt) }} style={styles.albumArt} />
                    <View style={styles.songDetails}>
                      <Text style={styles.songTitle}>{item.title}</Text>
                      <Text style={styles.songArtist}>{item.artist}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />

          {!postedSong && searchQuery ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handlePostSong(item)}
                >
                  <Image source={{ uri: item.album.images[0].url }} style={styles.resultAlbumArt} />
                  <Text style={styles.resultSongArtist}>
                    {item.name} - {item.artists[0].name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : null}

          {accessToken ? (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search for a song..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setPostedSong(false);
                  searchSpotify(text);
                }}
              />
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => promptAsync()} disabled={!request}>
              <Text style={styles.buttonText}>Login with Spotify to post a song</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
    //backgroundColor: '#131624',
  },
  list:{
    
  },
  button: {
    backgroundColor: '#1DB954',
    padding: 20,
    borderRadius: 30,
    //width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  searchContainer: {
    //flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#333',
    borderRadius: 35,
    marginHorizontal: 12,
    height: 60,
  },
  buttonSearch: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex : 1,
    color: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 30,
    padding: 10,
    //marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 20,
    backgroundColor: '#3A3D4E',
    borderRadius: 10,
  },
  resultAlbumArt: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginRight: 10,
  },
  resultSongArtist: {
    color: '#ccc',
    fontSize: 14,
  },
  albumArt: {
    width: 90,
    height: 90,
    borderRadius: 40,
    marginRight: 10,
  },
  songTitle: {
    color: '#fff',
    fontSize: 20,
  },
  postedSongItem: {
    //flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#282C35',
    borderRadius: 55,
    marginHorizontal: 15,
  },
  postedText: {
    color: '#fff',
    fontSize: 16,
  },
  postedMiniItem1:{
    margin: 5,
    marginBottom: 10,
    flexDirection: 'row',
    width: '85%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postedMiniItem2:{
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  songDetails: {
    marginLeft: 10,
  },
  songArtist: {
    color: '#ccc',
    fontSize: 14,
  },
  
});

export default SongBubble;
