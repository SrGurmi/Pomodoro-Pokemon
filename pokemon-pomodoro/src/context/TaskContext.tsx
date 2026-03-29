import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodorosCompleted: number;
  estimatedPomodoros: number;
  createdAt: string | number;
}

type TaskContextType = {
  tasks: Task[];
  addTask: (title: string, estimatedPomodoros: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  incrementPomodoro: (id: string) => Promise<void>;
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    apiGet<{ tasks: Task[] }>('/api/tasks')
      .then(data => setTasks(data.tasks))
      .catch(err => console.error('Failed to load tasks:', err));
  }, []);

  const addTask = useCallback(async (title: string, estimatedPomodoros: number = 1) => {
    const data = await apiPost<{ task: Task }>('/api/tasks', { title, estimatedPomodoros });
    setTasks(prev => [data.task, ...prev]);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await apiDelete(`/api/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTask?.id === id) setActiveTask(null);
  }, [activeTask]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const data = await apiPatch<{ task: Task }>(`/api/tasks/${id}`, { completed: !task.completed });
    setTasks(prev => prev.map(t => t.id === id ? data.task : t));
  }, [tasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const data = await apiPatch<{ task: Task }>(`/api/tasks/${id}`, updates);
    setTasks(prev => prev.map(t => t.id === id ? data.task : t));
  }, []);

  const incrementPomodoro = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newPomodoros = task.pomodorosCompleted + 1;
    const shouldComplete = task.estimatedPomodoros > 0 && newPomodoros >= task.estimatedPomodoros;
    const data = await apiPatch<{ task: Task }>(`/api/tasks/${id}`, {
      pomodorosCompleted: newPomodoros,
      completed: shouldComplete,
    });
    setTasks(prev => prev.map(t => t.id === id ? data.task : t));
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        deleteTask,
        toggleTask,
        updateTask,
        incrementPomodoro,
        activeTask,
        setActiveTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
