import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

// Important to note that in the database, the chat's id are composed like so: "selected user's id + _ + current user's (you) id"

export default function MessageItem({ message, currentUser }) {
  const formattedTime = message?.createdAt
    ? new Date(message.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Invalid Time'; 

  if (String(currentUser?.userId) === String(message?.userId)) {
    return ( //(them)
      <View style={styles.receivedMessageContainer}>
        <View style={styles.receivedMessageBubble}>
          <Text style={styles.messageText}>{message?.text}</Text>
          <Text style={styles.timestamp}>{formattedTime}</Text>
        </View>
      </View>
    );
  } else {
    return ( //(you)
      <View style={styles.sentMessageContainer}>
        <View style={styles.sentMessageBubble}>
          <Text style={styles.messageText}>{message?.text}</Text>
          <Text style={styles.timestamp}>{formattedTime}</Text>
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
    backgroundColor: '#5B4E75',
    borderRadius: 18,
    padding: 12,
    maxWidth: '80%',
  },
  receivedMessageBubble: {
    backgroundColor: '#2C253A',
    borderRadius: 18,
    padding: 12,
    maxWidth: '80%',
  },
  messageText: {
    color: '#fff',
    fontSize: 17,
  },
  timestamp: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-end', // Align timestamp to the bottom-right of the message
  },
});
