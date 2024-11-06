import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { Text, TextInput, View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { images } from "../constants";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const Profile = () => {
  const [isSignIn, setIsSignIn] = useState(true); 

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={images.crowd}
        style={styles.background}
      >
        <LinearGradient 
          colors={["transparent", "#040306"]}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setIsSignIn(true)} 
            style={[styles.tab, isSignIn && styles.activeTab]}
          >
            <Text style={[styles.tabText, isSignIn && styles.activeTabText]}>SIGN IN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsSignIn(false)} 
            style={[styles.tab, !isSignIn && styles.activeTab]}
          >
            <Text style={[styles.tabText, !isSignIn && styles.activeTabText]}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{isSignIn ? "Login to Concertify!" : "Sign Up for Concertify!"}</Text>

        {isSignIn ? 
        (
          // sign in 
          <>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="Email or username"
                placeholderTextColor="#999"
              />
              <FontAwesome name="envelope" size={20} color="#999" style={styles.icon} />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
              />
              <MaterialIcons 
                name="visibility-off" 
                size={20} 
                color="#999" 
                style={styles.icon} 
              />
            </View>

            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>LOG IN</Text>
            </TouchableOpacity>
          </>
        ) : 
        (
          // sign up 
          <>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
              />
              <FontAwesome 
                name="user" 
                size={20} 
                color="#999" 
                style={styles.icon} 
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
              />
              <FontAwesome 
                name="envelope" 
                size={20} 
                color="#999" 
                style={styles.icon}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry // hide the password
              />
              <MaterialIcons 
                name="lock" 
                size={20} 
                color="#999" 
                style={styles.icon} 
              />
            </View>

            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>SIGN UP</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            {isSignIn ? "Don't have an account?" : "Already have an account?"} 
          </Text>
          <TouchableOpacity 
            onPress={() => setIsSignIn(!isSignIn)} style={styles.signupLink}>
            <Text style={styles.signupLink}>
              {isSignIn ? "Sign up" : "Sign in"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040306',
  },
  background: {
    width: '100%',
    height: '70%',
    position: 'absolute',
    top: 0,
  },
  gradientOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
  },
  contentContainer: {
    flex: 1,
    marginTop: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '40%',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#A64D79', 
  },
  tabText: {
    fontSize: 18,
    color: '#999',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#fff',
  },
  icon: {
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#A64D79', 
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20,
  },
  signupText: {
    color: '#999',
    fontSize: 16,
  },
  signupLink: {
    color: '#A64D79', 
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 16,
  },
});

export default Profile;
