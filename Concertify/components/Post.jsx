import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Post = ({
  item,
  userId,
  onLikeToggle,
  onCommentNavigate,
  showProfile = true,
  showConcert = false,
  showCommentButton = true,
  showLike = true,
  containerStyle = {}, 
  contentStyle = {},
  likeContainerStyle = {},
}) => {
  const isLiked = item.likedBy?.includes(userId);

  return (
    <View style={[styles.postContainer, containerStyle]}>
      <View style={styles.postMiniContainer}>
      {showProfile? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Image source={{ uri: String(item.profilePicture) }} style={styles.profilePicture} />
          <Text style={styles.postUser}>{item.username}</Text>
        </View>
      ):(
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text style={styles.postUser}>{item.concertName}</Text>
        </View>
      )}
        <Text style={styles.timestamp}>
          {new Date(item.timestamp.seconds * 1000).toLocaleString()}
        </Text>
      </View>

      <Text style={[styles.postContent, contentStyle]}>{item.content}</Text>
      
      <View style={[styles.likeContainer, likeContainerStyle]}>
        {showLike && (
          <TouchableOpacity
            onPress={() => onLikeToggle(item.id, isLiked)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={30} color="#5B4E75" />
            <Text style={styles.lowerText}>
              {item.likes} {item.likes === 1 ? 'Like' : 'Likes'}
            </Text>
          </TouchableOpacity>
        )}

        {showCommentButton && (
          <TouchableOpacity
            onPress={() => onCommentNavigate(item)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <MaterialCommunityIcons name="comment-processing" size={30} color="#5B4E75" />
            <Text style={styles.lowerText}>Comments</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    padding: 5,
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
    padding: 10,
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

export default Post;
