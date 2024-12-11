import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, Image, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { format } from 'date-fns';

const Concert = () => {
  const { concertId } = useLocalSearchParams();
  const [concertDetails, setConcertDetails] = useState({});
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchConcertDetails = async () => {
      if (concertId) {
        const concertRef = doc(FIRESTORE_DB, 'concerts', concertId);
        const concertSnap = await getDoc(concertRef);
        if (concertSnap.exists()) {
          setConcertDetails(concertSnap.data());
        }
      }
    };

    const checkIfCheckedIn = async () => {
      onAuthStateChanged(FIREBASE_AUTH, async (user) => {
        if (user) {
          const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setIsCheckedIn(userData.concerts?.includes(concertId));
          }
        }
      });
    };

    fetchConcertDetails();
    checkIfCheckedIn();
  }, [concertId]);

  const handleCheckIn = async () => {
    onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
        await updateDoc(userDocRef, {
          concerts: arrayUnion(concertId),
        });
       
        setIsCheckedIn(true);
        router.push({
          pathname: '/concertPage',
          params: { concertId },
        });
      } else {
        router.replace('/login');
      }
    });
  };

  const formattedDate = concertDetails.date?.toDate 
  ? format(concertDetails.date.toDate(), 'MMMM dd, yyyy HH:mm') 
  : 'Date not available';

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
              colors={['transparent', 'rgba(1, 1, 1, 1.7)']}
              style={styles.overlay}>
              <View style={styles.overlayContent}>
                <Text style={styles.name}>{concertDetails.name}</Text>
               {/* <View style={styles.dateBadge}>
                   <Text style={styles.dateText}>{concertDetails.date || 'Date not available'}</Text> 
                </View> */}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={22} color="#fff" />
              <Text style={styles.infoText}>{concertDetails.location || 'Location not available'}</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={22} color="#fff" />
              <Text style={styles.infoText}>
        {concertDetails.date
          ? `${formattedDate} UTC+2`
          : 'Date not available'}
      </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{concertDetails.description}</Text>
          </View>

          {!isCheckedIn && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
                <Text style={styles.checkInText}>Check-in</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    position: 'relative',
  },
  largeImage: {
    width: '100%',
    height: '120%',
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    bottom: -60,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateBadge: {
    backgroundColor: '#9DBDFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#171B2C',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'space-between',
    marginTop: 10,
    top: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  descriptionContainer: {
    marginTop: 60,
    paddingHorizontal: 10,
    width: '100%',
  },
  descriptionTitle: {
    color: '#fff',
    fontSize: 20,
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
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#6A1E55',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  checkInText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Concert;