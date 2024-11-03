import { Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from "expo-linear-gradient";

const SongBubbleLayout = () => {
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <SafeAreaView>
        <Text>SongBubbleLayout</Text>
      </SafeAreaView>
    </LinearGradient>
  )
}

export default SongBubbleLayout