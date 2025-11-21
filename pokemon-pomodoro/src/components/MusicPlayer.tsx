
import React, { useState, useEffect, useRef } from 'react';
import { useSpotify } from '../context/SpotifyContext';

const MusicPlayer: React.FC = () => {
  const { isAuthenticated, login, token, player } = useSpotify();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');
  const [volume, setVolume] = useState(50);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (!token) return;

    // Inicializar el reproductor web de Spotify
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Pomodoro Player',
        getOAuthToken: (cb: (token: string) => void) => { cb(token); },
        volume: volume / 100
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('player_state_changed', (state: Spotify.PlayerState | null) => {
        if (!state) return;
        
        setCurrentTrack(state.track_window.current_track.name);
        setIsPlaying(!state.paused);
      });

      player.connect();

      return () => {
        player.disconnect();
      };
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [token, volume]);

  const togglePlay = async () => {
    if (!deviceId) return;
    
    const response = await fetch(`https://api.spotify.com/v1/me/player/${isPlaying ? 'pause' : 'play'}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: !isPlaying
      })
    });

    if (response.ok) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg">
        <button
          onClick={login}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Iniciar sesión con Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {currentTrack || 'No hay canción reproduciéndose'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="flex items-center space-x-2 w-32">
            <span className="text-gray-500">🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;