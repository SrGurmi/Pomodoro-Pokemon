import React, { createContext, useContext, useState, ReactNode } from 'react';

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  dateUnlocked?: Date;
};

type AchievementContextType = {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievement: (id: string) => boolean;
};

const defaultAchievements: Achievement[] = [
  {
    id: 'first-task',
    title: '¡Primera tarea completada!',
    description: 'Completa tu primera tarea',
    unlocked: false,
    icon: '✅'
  },
  {
    id: 'pomodoro-master',
    title: 'Maestro del Pomodoro',
    description: 'Completa 10 sesiones de Pomodoro',
    unlocked: false,
    icon: '🍅'
  },
  {
    id: 'early-bird',
    title: 'Madrugador',
    description: 'Completa una tarea antes de las 9 AM',
    unlocked: false,
    icon: '🌅'
  },
  {
    id: 'task-master',
    title: 'Maestro de Tareas',
    description: 'Completa 50 tareas',
    unlocked: false,
    icon: '🏆'
  }
];

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : defaultAchievements;
  });

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const updated = prev.map(ach => 
        ach.id === id && !ach.unlocked 
          ? { ...ach, unlocked: true, dateUnlocked: new Date() } 
          : ach
      );
      localStorage.setItem('achievements', JSON.stringify(updated));
      return updated;
    });
  };

  const checkAchievement = (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    return achievement ? achievement.unlocked : false;
  };

  return (
    <AchievementContext.Provider 
      value={{ 
        achievements, 
        unlockedAchievements, 
        unlockAchievement, 
        checkAchievement 
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};