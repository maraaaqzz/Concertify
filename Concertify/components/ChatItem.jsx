import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { images } from '../constants'

export default function ChatItem({item, router}) {
    const openChatRoom = () => {
        router.push({pathname: '/chatRoom', params:item})
    }
  return (
    <TouchableOpacity onPress={openChatRoom} style={styles.item}>
        {item.profileImage? (
          <Image source={{uri: item?.profileImage} } style={styles.profileImage} />
        ) : (
          <Image source={images.profilepic} style={styles.profileImage} />
        )}
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

const styles =  StyleSheet.create({
  item:{
    backgroundColor: '#1A1A1D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 7,
    marginBottom: 10,
    padding: 10,
    paddingHorizontal:18,
    borderRadius: 20,
    alignItems: 'center',
    gap: 3,
  },
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
      borderWidth: 4,
      borderColor: '#5B4E75',
    },
});