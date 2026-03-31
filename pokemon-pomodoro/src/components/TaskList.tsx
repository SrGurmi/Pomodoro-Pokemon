import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/context/TaskContext';
import { usePokemon } from '@/context/PokemonContext';
import { useAchievements } from '@/context/AchievementContext';
import { Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { Pokeball } from './ui/PokeBalls';

const TaskList: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const { addExperience } = usePokemon();
  const { unlockAchievement } = useAchievements();
  const [newTask, setNewTask] = useState('');

  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      if (tasks.length === 0) unlockAchievement('first-task');
      addTask(newTask.trim(), 1);
      setNewTask('');
    }
  };

  const handleCompleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      toggleTask(id);
      addExperience(10);
      const now = new Date();
      if (now.getHours() < 9) unlockAchievement('early-bird');
      if (tasks.filter(t => t.completed).length + 1 >= 50) unlockAchievement('task-master');
    } else {
      toggleTask(id);
    }
  };

  return (
    <div className="glass-strong rounded-3xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center">
          <Pokeball size={32} />
        </div>
        <h2 className="text-white font-bold text-lg tracking-wide flex-1">Misiones</h2>
        {done.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            +{done.length * 10} XP
          </span>
        )}
      </div>

      {/* Add task */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Nueva misión..."
          className="glass-input flex-1 px-4 py-2 rounded-xl text-sm text-white placeholder-white/40 outline-none"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Task list */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {pending.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 glass rounded-2xl px-4 py-3"
            >
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0 hover:border-emerald-400 transition-colors"
              />
              <span className="flex-1 text-sm text-white/90">{task.title}</span>
              <span className="text-xs text-white/40">🍅 {task.estimatedPomodoros}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-white/30 hover:text-red-400 transition-colors ml-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}

          {done.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-emerald-500/10 border border-emerald-500/20"
            >
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
              >
                <Check className="w-3 h-3 text-white" />
              </button>
              <span className="flex-1 text-sm text-white/40 line-through">{task.title}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <p className="text-center text-white/30 text-sm py-6">
            ¡Sin misiones! Añade una para ganar XP.
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskList;
