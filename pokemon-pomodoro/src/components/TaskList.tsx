// src/components/TaskList.tsx
import React, { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { usePokemon } from '@/context/PokemonContext';
import { useAchievements } from '@/context/AchievementContext';
import { Button } from './ui/button';
import { Plus, Trash2, Check } from 'lucide-react';

const TaskList: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const { addExperience } = usePokemon();
  const { unlockAchievement } = useAchievements();
  const [newTask, setNewTask] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask.trim(), 1); // 1 pomodoro estimado por defecto
      
      // Desbloquear logro de primera tarea si es la primera
      if (tasks.length === 0) {
        unlockAchievement('first-task');
      }
      
      setNewTask('');
    }
  };

  const handleCompleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      toggleTask(id);
      // Dar experiencia por completar tarea
      addExperience(10);
      
      // Verificar si es temprano en la mañana (logro madrugador)
      const now = new Date();
      if (now.getHours() < 9) {
        unlockAchievement('early-bird');
      }
      
      // Verificar si ha completado 50 tareas
      const completedTasks = tasks.filter(t => t.completed).length + 1;
      if (completedTasks >= 50) {
        unlockAchievement('task-master');
      }
    } else {
      toggleTask(id);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Tareas</h2>
      
      <form onSubmit={handleAddTask} className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Añadir una nueva tarea..."
          className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <Button type="submit" className="rounded-l-none">
          <Plus className="h-4 w-4 mr-1" /> Añadir
        </Button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-3 rounded ${
              task.completed
                ? 'bg-green-50 dark:bg-green-900/30'
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <div className="flex items-center flex-1">
              <button
                onClick={() => handleCompleteTask(task.id)}
                className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                  task.completed
                    ? 'bg-green-500 text-white'
                    : 'border-2 border-gray-400'
                }`}
              >
                {task.completed && <Check className="h-3 w-3" />}
              </button>
              <span
                className={`flex-1 ${
                  task.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {task.title}
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full ml-2">
                {task.estimatedPomodoros} 🍅
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 py-4">¡No hay tareas! Añade una para comenzar.</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;