import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../services/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
  where,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
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
          const postData = postSnap.data();
  
          let profilePicture = null;
          try {
            const usersQuery = query(
              collection(FIRESTORE_DB, 'users'),
              where('username', '==', postData.username)
            );
            const userSnapshot = await getDocs(usersQuery);
            if (!userSnapshot.empty) {
              profilePicture = userSnapshot.docs[0]?.data()?.profileImage;
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
  
          setPostDetails({
            ...postData,
            profilePicture: profilePicture || images.profilepic,
          });
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
    const fetchComments = () => {
      const commentsQuery = query(
        collection(FIRESTORE_DB, 'concerts', concertId, 'threads', postId, 'comments'),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(commentsQuery, async (querySnapshot) => {
        const commentsArray = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            let profilePicture = null;
            try {
              const usersQuery = query(
                collection(FIRESTORE_DB, 'users'),
                where('username', '==', data.username)
              );
              const userSnapshot = await getDocs(usersQuery);
              if (!userSnapshot.empty) {
                profilePicture = userSnapshot.docs[0]?.data()?.profileImage;
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }

            return {
              id: doc.id,
              ...data,
              profilePicture: profilePicture || images.profilepic,
            };
            
          })
        );
        setComments(commentsArray);
      });

      return unsubscribe;
    };

    return fetchComments();
  }, [concertId, postId]);

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      await addDoc(collection(FIRESTORE_DB, 'concerts', concertId, 'threads', postId, 'comments'), {
        username: currentUsername,
        content: comment.trim(),
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
      });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleLike = async (targetId, isLiked, isComment) => {
    const ref = doc(
      FIRESTORE_DB,
      'concerts',
      concertId,
      'threads',
      postId,
      isComment ? 'comments' : '',
      targetId
    );

    try {
      await updateDoc(ref, {
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        likes: increment(isLiked ? -1 : 1),
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const togglePostLike = async () => {
    if (!postDetails) return;

    const postRef = doc(FIRESTORE_DB, 'concerts', concertId, 'threads', postId);
    const isLiked = postDetails.likedBy?.includes(userId);

    try {
      await updateDoc(postRef, {
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        likes: increment(isLiked ? -1 : 1),
      });
    } catch (error) {
      console.error('Error toggling like for post:', error);
    }
  };

  const renderCommentItem = ({ item }) => {
    const isLiked = item.likedBy?.includes(userId);

    return (
      <View style={[styles.postContainer, {marginHorizontal:16}]}>
        <View style={styles.postMiniContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: item.profilePicture }} style={styles.profilePicture} />
            <Text style={styles.postUser}>{item.username}</Text>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp.seconds * 1000).toLocaleString()}
          </Text>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <View style={styles.likeContainer}>
          <TouchableOpacity onPress={() => toggleLike(item.id, isLiked, true)} style={{flexDirection:'row', alignItems: 'center'}}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color="#5B4E75" />
            <Text style={styles.lowerText}>
              {item.likes || 0} {item.likes === 1 ? 'Like' : 'Likes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          {postDetails && (
            <View style={styles.postContainer}>
              <View style={styles.postMiniContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: postDetails.profilePicture || images.profilepic }}
                    style={styles.profilePicture}
                  />
                  <Text style={styles.postUser}>{postDetails.username}</Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(postDetails.timestamp.seconds * 1000).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.postContent}>{postDetails.content}</Text>
              <View style={styles.likeContainer}>
                <TouchableOpacity onPress={togglePostLike} style={{flexDirection:'row', alignItems: 'center'}}>
                  <Ionicons
                    name={postDetails.likedBy?.includes(userId) ? 'heart' : 'heart-outline'}
                    size={24}
                    color="#5B4E75"
                  />
                  <Text style={styles.lowerText}>
                    {postDetails.likes || 0} {postDetails.likes === 1 ? 'Like' : 'Likes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderCommentItem}
            contentContainerStyle={styles.commentList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Respond to post"
              placeholderTextColor="#ccc"
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity
              onPress={addComment}
              style={styles.commentButton}
              disabled={!comment.trim()}
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
    backgroundColor: '#1A1A1D',
    padding: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  postMiniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  timestamp: {
    color: '#bbb',
    fontSize: 12,
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent:'flex-end',
    marginTop: 10,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1A1A1D',
    borderRadius: 20,
    borderColor: 'white',
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    color: '#fff',
    backgroundColor: '#333',
    borderRadius: 18,
    fontSize: 16,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: '#5B4E75',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CommentTab;
