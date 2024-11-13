import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

export const ConcertCard = ({ item }) => {
    const router = useRouter();

    const navigateToConcertInfo = () => {
        const concertDate = item.date.toDate();
        const date = concertDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        const time = concertDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
        router.push({
            pathname: '/concert',
            params: {
                concertId: item.id,
                name: item.name,
                imageKey: item.imageKey,
                photoUrl: item.photoUrl,
                location: item.location,
                date: date,
                time: time
            },
        });
    };

    const goTo = async () => {
        onAuthStateChanged(FIREBASE_AUTH, async (user) => {
            if(user){
                const userId = FIREBASE_AUTH.currentUser?.uid;
                const userDocRef = doc(FIRESTORE_DB, 'users', userId);
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists() && userDoc.data()?.concerts?.includes(item.id)) {
                        // If user has already checked in, go directly to concertPage
                        router.push({
                            pathname: '/concertPage',
                            params: { concertId: item.id },
                        });
                    }
                    else{
                        navigateToConcertInfo();
                    }
                } catch (error) {
                    console.error("Error checking user concerts:", error);
                }
            }
            else {
                navigateToConcertInfo();
            }
        });
    }

    return (
        <TouchableOpacity onPress={goTo} style={styles.cardContainer}>
          <Image
              style={styles.image}
              source={{uri:item.photoUrl}} 
          />
          <Text
              style={styles.title}
          >
              {item?.name}
          </Text>
        </TouchableOpacity>
    );
};

export default ConcertCard;

const styles = StyleSheet.create({
    cardContainer: {
      margin: 10,
      marginTop: 15
    },
    image: {
      width: 150,
      height: 150,
      borderRadius: 20, // for corners
    },
    title: {
      fontSize: 13,
      fontWeight: "500",
      color: "white",
      marginTop: 10,
    },
  });
