import React, { useState, useEffect, useRef } from 'react';
import { router, useGlobalSearchParams } from 'expo-router';
import { Dimensions, Animated, Text, FlatList, TextInput, StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig';
import { collection, addDoc, onSnapshot, orderBy, query, doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, where, getDocs } from 'firebase/firestore';
import { images } from '../../constants';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import UserList from '../../components/userList';
import Post from '../../components/Post';

const ThreadsTab = () => {
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const { concertId } = useGlobalSearchParams();
  const [isUserListVisible, setUserListVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const [attendingUsers, setAttendingUsers] = useState([]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (userId) {
        try {
          const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      }
    };
    fetchUsername();
  }, [userId]);

  const addPost = async (text) => {
    if (!text.trim()) return;
    try {
      const postRef = await addDoc(collection(FIRESTORE_DB, 'concerts', concertId, 'threads'), {
        username,
        content: text.trim(),
        timestamp: new Date(),
        likes: 0,
        likedBy: []
      });

      await updateDoc(postRef, { postId: postRef.id });
      setPost('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

useEffect(() => {
  const fetchAttendingUsers = async () => {
    try {
      const usersQuery = query(
        collection(FIRESTORE_DB, 'users'),
        where('concerts', 'array-contains', concertId) 
      );
      const querySnapshot = await getDocs(usersQuery);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username,
        profileImage: doc.data().profileImage || images.profilepic, 
      }));
      setAttendingUsers(users);
    } catch (error) {
      console.error('Error fetching attending users:', error);
    }
  };

  if (concertId) {
    fetchAttendingUsers();
  }
}, [concertId]);

  useEffect(() => {
    const fetchPosts = () => {
      const postsQuery = query(
        collection(FIRESTORE_DB, 'concerts', concertId, 'threads'),
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
        setPosts(postsArray);
      });
  
      return unsubscribe;
    };
  
    fetchPosts();
  }, [concertId]);

  const handleLikeToggle = async (postId, isLiked) => {
    const postRef = doc(FIRESTORE_DB, 'concerts', concertId, 'threads', postId);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(userId),
          likes: increment(-1)
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(userId),
          likes: increment(1)
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleUserList = () => {
    try {
      if (isUserListVisible) {
        // Slide out
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').width,
          duration: 300,
          useNativeDriver: false,
        }).start(() => setUserListVisible(false));
      } else {
        setUserListVisible(true);
        // Slide in
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
  };

  const renderPostItem = ({ item }) => {
    const handleCommentNavigate = (post) => {
      router.push({
        pathname: '/comments',
        params: {
          concertId,
          postId: post.id,
          postUsername: post.username,
          postContent: post.content,
          currentUsername: username,
        },
      });
    };
  
    return (
      <Post
        item={item}
        userId={userId}
        onLikeToggle={handleLikeToggle}
        onCommentNavigate={handleCommentNavigate}
      />
    );
  };

  return (
    
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Threads</Text>
            <TouchableOpacity onPress={toggleUserList} style={styles.rightCornerButton}>
              <Ionicons name="people-outline" size={34} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor="#ccc"
              value={post}
              onChangeText={setPost}
            />
            <TouchableOpacity
              onPress={() => addPost(post)}
              style={styles.postButton}
              disabled={!username || !post.trim()}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPostItem}
            contentContainerStyle={styles.postsList}
            onScrollBeginDrag={() => Keyboard.dismiss()}
          />

        <UserList
          isVisible={isUserListVisible}
          slideAnim={slideAnim}
          users={attendingUsers}
          onClose={toggleUserList}
        />
        
        </SafeAreaView>
    </LinearGradient>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  postsList: {
    marginHorizontal: 10,
    paddingTop: 10,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1A1A1D',
    //paddingHorizontal: 15,
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
  postButton: {
    backgroundColor: '#5B4E75',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profilePicture: {
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    borderColor: '#5B4E75',
    borderWidth: 3,
    marginRight: 5,
  },
  rightCornerButton: {
    position: 'absolute',
    right: 20, 
    top: 15,  
  },
  userListContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '70%',
    backgroundColor: '#1A1A1D',
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  userListTitle: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 45
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  userName: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#5B4E75',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
  
});

export default ThreadsTab;