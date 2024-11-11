import React, { useState, useEffect } from 'react';
import { Text, FlatList, TextInput, StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig';
import { collection, addDoc, onSnapshot, orderBy, query, doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

const ThreadsTab = () => {
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Fetch current user’s username
  useEffect(() => {
    const fetchUsername = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();
  }, [userId]);

  // Function to add a post
  const addPost = async (text) => {
    try {
      await addDoc(collection(FIRESTORE_DB, 'threads'), {
        username: username,
        content: text,
        timestamp: new Date(),
        likes: 0,  // Initialize with 0 likes
        likedBy: [] // Track users who have liked the post
      });
      setPost('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  // Function to fetch posts
  useEffect(() => {
    const postsQuery = query(collection(FIRESTORE_DB, 'threads'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      const postsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsArray);
    });
    return () => unsubscribe();
  }, []);

  // Function to handle like button press
  const handleLikeToggle = async (postId, isLiked) => {
    const postRef = doc(FIRESTORE_DB, 'threads', postId);

    if (isLiked) {
      // Unlike: remove the user's ID from likedBy and decrement likes count
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likes: increment(-1)
      });
    } else {
      // Like: add the user's ID to likedBy and increment likes count
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likes: increment(1)
      });
    }
  };

  // Render each post item
  const renderPostItem = ({ item }) => {
    const isLiked = item.likedBy?.includes(userId);
    
    return (
      <View style={styles.postContainer}>
        <Text style={styles.postUser}>{item.username}</Text>
        <Text style={styles.postContent}>{item.content}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp.seconds * 1000).toLocaleString()}</Text>
        <View style={styles.likeContainer}>
          <TouchableOpacity
            onPress={() => handleLikeToggle(item.id, isLiked)}
            style={[styles.likeButton, isLiked ? styles.liked : null]}
          >
            <Text style={styles.likeButtonText}>{isLiked ? 'Unlike' : 'Like'}</Text>
          </TouchableOpacity>
          <Text style={styles.likeCount}>{item.likes} {item.likes === 1 ? 'Like' : 'Likes'}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>
          {/* Posts List */}
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPostItem}
            contentContainerStyle={styles.postsList}
            onScrollBeginDrag={() => Keyboard.dismiss()}
          />

          {/* Input and Post Button at the Bottom */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor="#ccc"
              value={post}
              onChangeText={(text) => setPost(text)}
            />
            <TouchableOpacity
              onPress={() => addPost(post)}
              style={styles.postButton}
              disabled={!username || !post.trim()}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  postContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  postUser: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postContent: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  timestamp: {
    color: '#bbb',
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  likeButton: {
    backgroundColor: '#A64D79',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  liked: {
    backgroundColor: '#FF69B4',  // Different color for liked state
  },
  likeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  likeCount: {
    color: '#ccc',
    fontSize: 14,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#333',
    paddingHorizontal: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#fff',
    backgroundColor: '#333',
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  postButton: {
    backgroundColor: '#A64D79',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ThreadsTab;
