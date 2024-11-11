import { Text, FlatList, TextInput, StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from "expo-linear-gradient";
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../services/firebaseConfig'
import { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, getDoc, where } from 'firebase/firestore';

const ThreadsTab = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const getPosts = async () => {

      const q = query(collection(FIRESTORE_DB, "threads"));
      

      const querySnapshot = await getDocs(q);
      const fetchedPosts = [];

      querySnapshot.forEach(async (doc) => {
        const userQuery = query(collection(FIRESTORE_DB, "users"), where("username", "==", doc.get("username")));
        const userSnapshot = await getDocs(userQuery);
        const username = userSnapshot.empty ? "Unknown" : userSnapshot.docs[0].get("username");

        fetchedPosts.push({
          id: doc.id,
          title: doc.get("content"),
          username: username,
          timestamp: doc.get("timestamp")
        });
        console.log(doc.id, " => ", doc.data());
      });
      setPosts(fetchedPosts);
    };
    
    getPosts();
  }, []);

  const addPost = async (userId, text) => {   
    try {
      const postRef = await addDoc(collection(FIRESTORE_DB, "threads"), {
        threadId: postRef.id,
        userId: userId,
        content: text,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };
  
  const Item = ({username, content, timestamp}) => {
    return( 
      <View style={styles.item}>
        <Text style={styles.itemText}>{username}</Text>
        <Text style={styles.itemText}>{content}</Text>
        <Text style={styles.itemText}>{timestamp}</Text>
      </View>
    );
  }
  const renderItem = ({item})=>( 
    <Item title={item.title}/>
  );
  return (
    <LinearGradient 
      colors={['#040306', '#131624']}
      style={{ flex: 1 }} 
    >
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    padding:2,
  },
  item: {
    backgroundColor: '#6A1E55',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  itemText: {
    color: '#fff'
  }
});

export default ThreadsTab