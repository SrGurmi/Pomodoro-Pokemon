// src/types/global.d.ts
import { Spotify } from './spotify';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: Spotify.PlayerConstructor;
    };
  }
}
