import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from 'expo-router'; 

export const ConcertCard = ({ item }) => {
    const router = useRouter();

    const navigateToConcertInfo = () => {
        router.push({
            pathname: '/concert', 
            params: {
                name: item.name,
                imageKey: item.imageKey,
            },
        });
    };

    return (
        <TouchableOpacity onPress={navigateToConcertInfo} style={styles.cardContainer}>
          <Image
              style={styles.image}
              source={item.image} // change with uri from database like source={{ uri: item.images[0].url }}
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
