declare namespace Spotify {
  interface TrackWindow {
    current_track: {
      name: string;
      uri: string;
      album: {
        uri: string;
        name: string;
        images: Array<{ url: string }>;
      };
      artists: Array<{ name: string; uri: string }>;
    };
    previous_tracks: any[];
    next_tracks: any[];
  }

  interface PlayerState {
    paused: boolean;
    track_window: TrackWindow;
    position: number;
    duration: number;
    loading: boolean;
  }

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: 'player_state_changed', callback: (state: PlayerState | null) => void): void;
    addListener(event: string, callback: (state: any) => void): void;
    removeListener(event: string, callback?: (state: any) => void): void;
    getCurrentState(): Promise<PlayerState | null>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    on(event: 'ready', callback: (data: { device_id: string }) => void): void;
    on(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
    on(event: 'initialization_error', callback: (error: any) => void): void;
    on(event: 'authentication_error', callback: (error: any) => void): void;
    on(event: 'account_error', callback: (error: any) => void): void;
    on(event: 'playback_error', callback: (error: any) => void): void;
    on(event: 'player_state_changed', callback: (state: PlayerState | null) => void): void;
  }

  interface PlayerConstructor {
    new (options: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }): Player;
  }
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: Spotify.PlayerConstructor;
    };
  }
}