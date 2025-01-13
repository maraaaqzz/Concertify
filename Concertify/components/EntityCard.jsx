import React from "react";
import { StyleSheet, Text, TouchableOpacity, ImageBackground, View } from "react-native";
import { useRouter } from "expo-router";

export const EntityCard = ({ entity, type }) => {
  const router = useRouter();

  const navigateToEntity = () => {
    router.push({
      pathname: type === "category" ? "/categoryConcerts" : "/genreConcerts",
      params: { [type]: entity.name },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={navigateToEntity}>
      <ImageBackground
        source={{ uri: entity.image }}
        style={styles.backgroundImage}
        imageStyle={{ borderRadius: 40 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>{entity.name}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default EntityCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 40,
    width: 170,
    height: 70,
    margin: 5,
    overflow: "hidden",
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 40,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
