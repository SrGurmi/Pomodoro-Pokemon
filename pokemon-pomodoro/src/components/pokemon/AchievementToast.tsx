// src/components/pokemon/AchievementToast.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

type AchievementToastProps = {
  title: string;
  description: string;
  onClose: () => void;
  type: 'level-up' | 'achievement' | 'task-complete';
  show?: boolean;
};

const AchievementToast: React.FC<AchievementToastProps> = ({ 
  title, 
  description, 
  onClose,
  type,
  show = true
}) => {
  useEffect(() => {
    if (show && type === 'level-up') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [show, type]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-yellow-500 z-50 max-w-sm"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;