import {authorize} from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const spotifyAuthConfig = {
    clientId: '4eb8e4c38a89447095e9dfa069ad49e6',
    clientSecret: '99d5b0d5b82a4d328ed70ee057ca3d23',
    redirectUrl: 'spotify.com', // Match the redirect URI in Spotify Dashboard
    scopes: [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'user-library-read', // Add required scopes
    ],
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
  };

  const authenticateWithSpotify = async () => {
    try {
      const result = await authorize(spotifyAuthConfig);
      console.log('Access Token:', result.accessToken);
      return result;
    } catch (error) {
      console.error('Error authenticating with Spotify:', error);
    }
  };
  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = await response.json();
      console.log('User Profile:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  const saveToken = async (token) => {
    try {
      await AsyncStorage.setItem('spotifyAccessToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };
  
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('spotifyAccessToken');
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${spotifyAuthConfig.clientId}:${spotifyAuthConfig.clientSecret}`)}`,
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      });
      const data = await response.json();
      console.log('New Access Token:', data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
    }
  };