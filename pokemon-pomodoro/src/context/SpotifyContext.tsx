// src/context/SpotifyContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { spotifyConfig } from '../config/spotify';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

interface SpotifyContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  token: string | null;
  player: any; // Use 'any' to avoid TypeScript errors with Spotify Player
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Try to get token from URL first, then localStorage
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      // Clean up URL
      window.history.pushState({}, document.title, window.location.pathname);
      localStorage.setItem('spotify_token', accessToken);
      return accessToken;
    }
    
    return localStorage.getItem('spotify_token');
  });
  
  const [player, setPlayer] = useState<any>(null);

  // Initialize Web Playback SDK when token is available
  useEffect(() => {
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('Spotify Web Playback SDK ready!');
      
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Pomodoro Player',
        getOAuthToken: (cb: (token: string) => void) => {
          if (token) cb(token);
        },
        volume: 0.5
      });

      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
      });

      spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization Error:', message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication Error:', message);
        logout();
      });

      spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Playback Error:', message);
      });

      spotifyPlayer.connect().then((success: boolean) => {
        if (success) {
          console.log('Connected to Spotify!');
          setPlayer(spotifyPlayer);
        }
      });
    };

    document.body.appendChild(script);

    return () => {
      if (player) {
        player.disconnect();
      }
      document.body.removeChild(script);
    };
  }, [token]);

  const login = useCallback(() => {
    const authUrl = new URL(spotifyConfig.authEndpoint);
    const params = {
      client_id: spotifyConfig.clientId,
      response_type: 'token',
      redirect_uri: spotifyConfig.redirectUri,
      scope: spotifyConfig.scopes,
      show_dialog: spotifyConfig.showDialog.toString()
    };

    // Convert params to URLSearchParams
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    window.location.href = `${authUrl}?${searchParams.toString()}`;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('spotify_token');
    if (player) {
      player.disconnect();
      setPlayer(null);
    }
  }, [player]);

  const value = {
    isAuthenticated: !!token,
    login,
    logout,
    token,
    player
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};

