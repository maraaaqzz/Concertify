import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from 'expo-router';

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

    return (
        <TouchableOpacity onPress={navigateToConcertInfo} style={styles.cardContainer}>
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
