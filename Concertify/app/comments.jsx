import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, FlatList, TextInput, StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import { collection, doc, getDoc, addDoc, onSnapshot, orderBy, query, updateDoc, arrayUnion, arrayRemove, increment, getDocs, where } from 'firebase/firestore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { images } from '../constants';

const CommentTab = () => {
  const { concertId, postId, currentUsername } = useLocalSearchParams();

  const [postDetails, setPostDetails] = useState(null); 
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const userId = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const postRef = doc(FIRESTORE_DB, 'concerts', concertId, 'threads', postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          setPostDetails(postSnap.data());
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    fetchPostDetails();
  }, [concertId, postId]);

  useEffect(() => {
    const fetchPosts = () => {
      const postsQuery = query(
        collection(FIRESTORE_DB, 'concerts', concertId, 'threads', postId, 'comments'),
        orderBy('timestamp', 'desc')
      );
  
      const unsubscribe = onSnapshot(postsQuery, async (querySnapshot) => {
        const postsArray = await Promise.all(
          querySnapshot.docs.map(async (postDoc) => {
            const postData = postDoc.data();
            let profilePicture = null;
  
            try {
              const usersQuery = query(
                collection(FIRESTORE_DB, 'users'),
                where('username', '==', postData.username)
              );
              const userSnapshot = await getDocs(usersQuery);
  
              if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0]; 
                profilePicture = userDoc.data().profileImage;
              }
            } catch (error) {
              console.error('Error fetching profile picture:', error);
            }
  
            return {
              id: postDoc.id,
              ...postData,
              profilePicture: profilePicture || images.profilepic, 
            };
          })
        );
        setComments(postsArray);
      });
  
      return unsubscribe;

    };
  
    fetchPosts();
  }, [concertId, postId]);

  const addComment = async (text) => {
    try {
      await addDoc(collection(FIRESTORE_DB, 'concerts', concertId, 'threads', postId, 'comments'), {
        username: currentUsername,
        content: text,
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
      });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeToggle = async (commentId, isLiked) => {
    const postRef = doc(FIRESTORE_DB, 'concerts', concertId, 'threads', postId, 'comments', commentId);

    if (isLiked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likes: increment(-1),
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likes: increment(1),
      });
    }
  };

  const renderCommentItem = ({ item }) => {
    const isLiked = item.likedBy?.includes(userId);

    return (
      <View style={styles.postContainer}>
        
        <View style={styles.postMiniContainer}>
          <View style={{flexDirection: 'row', justifyContent:'flex-start', alignItems: 'center'}}>
            <Image source={{ uri: String(item.profilePicture) }} style={styles.profilePicture} />
            <Text style={styles.postUser}>{item.username}</Text>
          </View>
          <Text style={styles.timestamp}>{new Date(item.timestamp.seconds * 1000).toLocaleString()}</Text>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>
        
        <View style={styles.likeContainer}>

          <TouchableOpacity
            onPress={() => handleLikeToggle(item.id, isLiked)}
            style={{flexDirection:'row', alignItems: 'center'}}
            >
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={30} color="#5B4E75"/>
            <Text style={styles.lowerText}>{item.likes} {item.likes === 1 ? 'Like' : 'Likes'}</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1, marginBottom: 30 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>
          {postDetails ? (
            <View style={styles.postContainer}>
              <Text style={styles.postUser}>{postDetails.username}</Text>
              <Text style={styles.postContent}>{postDetails.content}</Text>
            </View>
          ) : (
            <Text style={styles.loadingText}>Loading post...</Text>
          )}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderCommentItem}
            contentContainerStyle={styles.commentList}
            onScrollBeginDrag={() => Keyboard.dismiss()}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Respond to post"
              placeholderTextColor="#ccc"
              value={comment}
              onChangeText={(text) => setComment(text)}
            />
            <TouchableOpacity
              onPress={() => addComment(comment)}
              style={styles.commentButton}
              disabled={!currentUsername || !comment.trim()}
            >
              <Text style={styles.commentButtonText}>Comment</Text>
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
  postContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  postUser: {
    marginBottom: 5,
    alignContent: 'center',
    color: '#aaa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContent: {
    color: '#fff',
    fontSize: 23,
    marginBottom: 5,
  },
  commentList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  commentContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  commentUserContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  commentUser: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: 'bold',
  },
  commentContent: {
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
  liked: {
    backgroundColor: '#FF69B4',
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
    borderColor: 'white',
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
  commentButton: {
    backgroundColor: '#A64D79',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postContainer: {
    backgroundColor: '#1A1A1D',
    padding: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  postMiniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding:10,
    borderRadius: 20,
  },
  postUser: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postContent: {
    color: '#fff',
    fontSize: 19,
    marginVertical: 5,
    marginHorizontal: 5,
    padding:5,
    borderRadius: 20,
  },
  timestamp: {
    color: '#bbb',
    fontSize: 12,
  },
  likeContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    padding:10,
    borderRadius: 20,
  },
  lowerText: {
    color: '#ccc',
    fontSize: 14,
    marginHorizontal: 5,
  },
  profilePicture: {
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    borderColor: '#5B4E75',
    borderWidth: 3,
    marginRight: 5,
  },
});

export default CommentTab;
