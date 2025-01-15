import React from "react";
import { ScrollView, View } from "react-native";
import EntityCard from "./EntityCard";

// for categories and genres
export const EntityList = ({ entities = [], type }) => {
  if (!entities || entities.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {entities.map((entity) => (
          <EntityCard entity={entity} type={type} key={entity.id || entity.name} />
        ))}
      </ScrollView>
    </View>
  );
};

export default EntityList;
