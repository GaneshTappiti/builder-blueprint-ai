import { useState, useEffect } from 'react';
import { taskService, Task, TaskStats } from '@/services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });

  useEffect(() => {
    // Initial load
    setTasks(taskService.getTasks());
    setStats(taskService.getTaskStats());

    // Subscribe to changes
    const unsubscribe = taskService.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
      setStats(taskService.getTaskStats());
    });

    return unsubscribe;
  }, []);

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return taskService.createTask(taskData);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    return taskService.updateTask(id, updates);
  };

  const deleteTask = (id: string) => {
    return taskService.deleteTask(id);
  };

  const getTask = (id: string) => {
    return taskService.getTask(id);
  };

  const getRecentTasks = () => {
    return taskService.getRecentTasks();
  };

  const getTasksByStatus = (status: Task['status']) => {
    return taskService.getTasksByStatus(status);
  };

  const getOverdueTasks = () => {
    return taskService.getOverdueTasks();
  };

  return {
    tasks,
    stats,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    getRecentTasks,
    getTasksByStatus,
    getOverdueTasks,
    formatTimeAgo: taskService.formatTimeAgo.bind(taskService),
    formatDueDate: taskService.formatDueDate.bind(taskService),
    getPriorityColor: taskService.getPriorityColor.bind(taskService),
    getStatusColor: taskService.getStatusColor.bind(taskService)
  };
};
