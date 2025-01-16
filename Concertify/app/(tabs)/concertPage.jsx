import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, Image, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FIRESTORE_DB } from '../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import CountdownTimer from '../../components/CountdownTimer';

const ConcertPage = () => {
  const { concertId } = useLocalSearchParams();
  const [concertDetails, setConcertDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConcertDetails = async () => {
      if (concertId) {
        const concertRef = doc(FIRESTORE_DB, 'concerts', concertId);
        const concertSnap = await getDoc(concertRef);
        if (concertSnap.exists()) {
          setConcertDetails(concertSnap.data());
        }
        setLoading(false);
      }
    };

    fetchConcertDetails();
  }, [concertId]);

  const formattedDate = concertDetails.date?.toDate
    ? format(concertDetails.date.toDate(), 'MMMM dd, yyyy HH:mm')
    : 'Date not available';

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DBDFF" />
        <Text style={styles.loadingText}>Loading Concert Details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      
      <ScrollView style={styles.scrollContent}>
        <SafeAreaView style={styles.container}>
          <View style={styles.imageContainer}>
            {concertDetails.photoUrl ? (
              <Image source={{ uri: concertDetails.photoUrl }} style={styles.largeImage} />
            ) : (
              <Text style={styles.errorText}>Image not found</Text>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(1, 1, 1, 0.8)']}
              style={styles.overlay}>
              <View style={styles.overlayContent}>
                <Text style={styles.name}>{concertDetails.name || 'Concert Name'}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={22} color="#fff" />
              <Text style={styles.infoText}>{concertDetails.location || 'Location not available'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={22} color="#fff" />
              <Text style={styles.infoText}>
                {concertDetails.date ? `${formattedDate} UTC+2` : 'Date not available'}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <CountdownTimer targetDate={concertDetails.date?.toDate()} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About the Artist</Text>
            <Text style={styles.descriptionText}>
              {concertDetails.description || 'Details about the artist will be available soon.'}
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>NEWS!</Text>
            <Text style={styles.descriptionText}>Stay tuned for updates!</Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    marginBottom: 20,
    position: 'relative',
    borderRadius: 15,
    overflow: 'hidden',
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    bottom: -3,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 10,
    left: 20, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#171B2C',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  descriptionContainer: {
    marginTop: 20,
    width: '100%',
  },
  descriptionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'justify',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#040306',
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
  },
});

export default ConcertPage;
