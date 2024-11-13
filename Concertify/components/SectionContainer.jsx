import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { ConcertCard } from "../components/ConcertCard";

export const SectionContainer = ({ title, data }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data.map((item, index) => (
          <ConcertCard item={item} key={index} />
        ))}
      </ScrollView>
    </View>
  );
};

export default SectionContainer;

