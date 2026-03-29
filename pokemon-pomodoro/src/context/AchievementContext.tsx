import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiGet, apiPost } from '../lib/api';

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  unlockedAt?: string | null;
};

type AchievementContextType = {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievement: (id: string) => boolean;
};

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    apiGet<{ achievements: Achievement[] }>('/api/achievements')
      .then(data => setAchievements(data.achievements))
      .catch(err => console.error('Failed to load achievements:', err));
  }, []);

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const unlockAchievement = useCallback((id: string) => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return;

    apiPost<{ achievement: Achievement; alreadyUnlocked: boolean }>(`/api/achievements/${id}/unlock`)
      .then(data => {
        if (!data.alreadyUnlocked) {
          setAchievements(prev =>
            prev.map(a => a.id === id ? data.achievement : a)
          );
        }
      })
      .catch(err => console.error('Failed to unlock achievement:', err));
  }, [achievements]);

  const checkAchievement = useCallback((id: string) => {
    return achievements.find(a => a.id === id)?.unlocked ?? false;
  }, [achievements]);

  return (
    <AchievementContext.Provider
      value={{ achievements, unlockedAchievements, unlockAchievement, checkAchievement }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) throw new Error('useAchievements must be used within an AchievementProvider');
  return context;
};
