import React, { useState, useEffect } from 'react';
import { router, useGlobalSearchParams } from 'expo-router';
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

  const {concertId} = useGlobalSearchParams();

  // Fetch current user’s username
  useEffect(() => {
    const fetchUsername = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
      else{
        console.log("error");
      }
    };
    fetchUsername();
  }, [userId]);
  // Function to add a post
  const addPost = async (text) => {
    try {
      const postRef = await addDoc(collection(FIRESTORE_DB, 'concerts', concertId, 'threads'), {
        username: username,
        content: text,
        timestamp: new Date(),
        likes: 0,  // Initialize with 0 likes
        likedBy: [] // Track users who have liked the post
      });

      await updateDoc(postRef, {
        postId: postRef.id
      });

      setPost('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  // Function to fetch posts
  useEffect(() => {
    const postsQuery = query(collection(FIRESTORE_DB,'concerts', concertId, 'threads'), orderBy('timestamp', 'desc'));
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
    const postRef = doc(FIRESTORE_DB, 'concerts', concertId, 'threads', postId);

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
        <View style={styles.postMiniContainer}>
          <Text style={styles.postUser}>{item.username}</Text>
          <Text style={styles.timestamp}>{new Date(item.timestamp.seconds * 1000).toLocaleString()}</Text>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <View style={styles.likeContainer}>
          <TouchableOpacity
            onPress={() => handleLikeToggle(item.id, isLiked)}
            style={[styles.likeButton, isLiked ? styles.liked : null]}
          >
            <Text style={styles.likeButtonText}>{isLiked ? 'Unlike' : 'Like'}</Text>
          </TouchableOpacity>
          <Text style={styles.likeCount}>{item.likes} {item.likes === 1 ? 'Like' : 'Likes'}</Text>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: `/comments`, 
              params: {
                concertId: concertId,
                postId: item.id,
                postUsername: item.username,
                postContent: item.content,
                currentUsername: username,
              } 
            })}
            style={styles.commentButton }
          >
            <Text style={styles.likeButtonText}>Comments</Text>
          </TouchableOpacity>
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
            initialNumToRender={5}  
            maxToRenderPerBatch={10}
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
    borderRadius: 20,
    marginBottom: 10,
  },
  postMiniContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  postUser: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: 'bold',
  },
  postContent: {
    color: '#fff',
    fontSize: 19,
    marginBottom: 5,
  },
  timestamp: {
    color: '#bbb',
    fontSize: 12,
  },
  likeContainer: {
    justifyContent: 'space-between',
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
  commentButton: {
    backgroundColor: '#A64D79',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
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
    flex: 3,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 2,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#333',
    paddingHorizontal: 15,
    borderRadius: 20,
    borderColor: 'white'
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
  commentContainer: {
    marginTop: 10,
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#444',
  },
});

export default ThreadsTab;