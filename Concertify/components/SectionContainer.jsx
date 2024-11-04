import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { ConcertCard } from "../components/ConcertCard";

export const SectionContainer = ({ title, data }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data.map((item, index) => (
          <ConcertCard item={item} key={index} />
        ))}
      </ScrollView>
    </View>
  );
};

export default SectionContainer;

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: "#131624",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginHorizontal: 10,
    marginTop: 10,
  },
  titleText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
});
