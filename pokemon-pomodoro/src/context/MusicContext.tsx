
import React, { createContext, useContext, useState, useEffect } from 'react';

type MusicTrack = {
  id: string;
  name: string;
  file: File;
  url: string;
};

type MusicContextType = {
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  addTrack: (file: File) => void;
  removeTrack: (id: string) => void;
  playTrack: (id: string) => void;
  togglePlayPause: () => void;
  volume: number;
  setVolume: (volume: number) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audio] = useState(() => new Audio());

  useEffect(() => {
    const savedTracks = localStorage.getItem('pomodoro-music-tracks');
    if (savedTracks) {
      try {
        const parsedTracks = JSON.parse(savedTracks);
        setTracks(parsedTracks);
      } catch (error) {
        console.error('Failed to load saved tracks', error);
      }
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoro-music-tracks', JSON.stringify(tracks));
  }, [tracks]);

  const addTrack = (file: File) => {
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    const newTrack = { id, name: file.name, file, url };
    setTracks(prev => [...prev, newTrack]);
  };

  const removeTrack = (id: string) => {
    setTracks(prev => {
      const newTracks = prev.filter(track => track.id !== id);
      if (currentTrack?.id === id) {
        audio.pause();
        setIsPlaying(false);
        setCurrentTrack(null);
      }
      return newTracks;
    });
  };

  const playTrack = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    if (currentTrack?.id === id) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    } else {
      audio.pause();
      audio.src = track.url;
      audio.volume = volume;
      audio.loop = true;
      audio.play().catch(console.error);
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <MusicContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        addTrack,
        removeTrack,
        playTrack,
        togglePlayPause,
        volume,
        setVolume: (vol) => {
          const newVolume = Math.max(0, Math.min(1, vol));
          setVolume(newVolume);
          audio.volume = newVolume;
        },
      }}
    >
      {children}
      <audio
        ref={(el) => {
          if (el) {
            el.volume = volume;
          }
        }}
      />
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export default MusicContext;