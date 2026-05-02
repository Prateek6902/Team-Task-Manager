import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '../services/taskService';
import toast from 'react-hot-toast';

export const useTasks = (projectId = null) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    project: projectId || '',
    sort: '-createdAt',
    page: 1,
    limit: 20
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTasks(filters);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const response = await createTask(taskData);
      setTasks(prev => [response.data, ...prev]);
      toast.success('Task created successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const editTask = async (id, taskData) => {
    try {
      const response = await updateTask(id, taskData);
      setTasks(prev => prev.map(t => t._id === id ? response.data : t));
      toast.success('Task updated successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  const changeTaskStatus = async (id, status) => {
    try {
      const response = await updateTaskStatus(id, status);
      setTasks(prev => prev.map(t => t._id === id ? response.data : t));
      toast.success(`Task marked as ${status}`);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      throw err;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    tasks,
    loading,
    error,
    filters,
    addTask,
    editTask,
    removeTask,
    changeTaskStatus,
    updateFilters,
    refetch: fetchTasks
  };
};