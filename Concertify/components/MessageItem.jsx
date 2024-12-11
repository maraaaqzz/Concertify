import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function MessageItem({ message, currentUser }) {
 

  if (String(currentUser?.userId) === String(message?.userId)) {
    return (
      <View style={styles.sentMessageContainer}>
        <View style={styles.sentMessageBubble}>
          <Text style={styles.messageText}>{message?.text}</Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.receivedMessageContainer}>
        <View style={styles.receivedMessageBubble}>
          <Text style={styles.messageText}>{message?.text}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sentMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    marginRight: 15,
  },
  receivedMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginLeft: 15,
  },
  sentMessageBubble: {
    backgroundColor: '#5B4E75', // Dark background for sent messages
    borderRadius: 18,
    padding: 12,
    maxWidth: '80%',
  },
  receivedMessageBubble: {
    backgroundColor: '#2C253A', // Different color for received messages
    borderRadius: 18,
    padding: 12,
    maxWidth: '80%',
  },
  messageText: {
    color: '#fff', // White text color
    fontSize: 17,
  },
});
