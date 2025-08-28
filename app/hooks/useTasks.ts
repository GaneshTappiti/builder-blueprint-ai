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

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => {
    return await taskService.createTask(taskData);
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'user_id'>>) => {
    return await taskService.updateTask(id, updates);
  };

  const deleteTask = async (id: string) => {
    return await taskService.deleteTask(id);
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
