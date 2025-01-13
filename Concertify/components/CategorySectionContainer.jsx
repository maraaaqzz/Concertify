import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import ConcertCard from "../components/ConcertCard";

export const CategorySectionContainer = ({ title, data }) => {
  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <ConcertCard item={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2} 
        columnWrapperStyle={styles.row} 
        showsVerticalScrollIndicator={false} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  cardContainer: {
    flex: 1,
    margin: 5, 
  },
  row: {
    justifyContent: "space-between",
  },
});

export default CategorySectionContainer;
