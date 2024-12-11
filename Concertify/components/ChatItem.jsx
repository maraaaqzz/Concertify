import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'

export default function ChatItem({item, router, noBorder}) {
    const openChatRoom = () => {
        router.push({pathname: '/chatRoom', params:item})
    }
  return (
    <TouchableOpacity onPress={openChatRoom} className={`flex-row justify-between mx-4 items-center gap-3 mb-4 pb-2 ${noBorder? '': 'border-b border-b-neutral-200'}`}>
        <Image source={{uri: item?.profileImage}} style={styles.profileImage} />

        {/* name and last message */}
        <View className="flex-1 gap-1">
            <View className="flex-row justify-between">
                <Text style={styles.text}> {item?.username}</Text>
                <Text style={styles.textMessage}> Time</Text>
            </View>
            <Text style={styles.textMessage}> Last Message </Text>
        </View>


    </TouchableOpacity>

    
  )
}

const styles = StyleSheet.create({
    text: {
      color: 'white', // Makes the text color white
      fontSize: 18
    },
    textMessage: {
        color: 'white', // Makes the text color white
        fontSize: 13
      },
    profileImage: {
        width: 60, // Small size for the circle
        height: 60, // Make it a square for the circle to work
        borderRadius: 30, // Half of width/height to make it circular
        marginRight: 10, // Space between the image and any text/content
      },
  });