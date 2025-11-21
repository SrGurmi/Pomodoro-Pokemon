import { useEffect, useRef, useCallback } from 'react';

export const useSound = (src: string, volume = 0.5) => {
  const sound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    sound.current = new Audio(src);
    sound.current.volume = volume;
    
    return () => {
      if (sound.current) {
        sound.current.pause();
        sound.current = null;
      }
    };
  }, [src, volume]);

  const play = useCallback(() => {
    if (sound.current) {
      sound.current.currentTime = 0;
      sound.current.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    } else {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(error => console.error('Error playing sound:', error));
    }
  }, [src, volume]);

  return play;
};