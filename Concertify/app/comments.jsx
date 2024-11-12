import React, { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB } from '../services/firebaseConfig';

const CommentTab = ({ route }) => {
  const { postId } = useLocalSearchParams();// Get postId from route parameters
  const [comments, setComments] = useState([]);

  // Fetch comments when the component mounts
  useEffect(() => {
    const commentsRef = collection(FIRESTORE_DB, 'threads', postId, 'comments');
    const commentsQuery = query(commentsRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, [postId]);

  // Render each comment item
  const renderCommentItem = ({ item }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentUser}>{item.username}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentTimestamp}>{new Date(item.timestamp.seconds * 1000).toLocaleString()}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Comments</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderCommentItem}
          contentContainerStyle={styles.commentsList}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  commentsList: {
    paddingBottom: 20,
  },
  commentContainer: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  commentUser: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 5,
  },
  commentTimestamp: {
    color: '#777',
    fontSize: 12,
    textAlign: 'right',
  },
});

export default CommentTab;
