import { useState, useEffect, useCallback } from 'react';
import { getProjects, createProject, deleteProject } from '../services/projectService';
import toast from 'react-hot-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    sort: '-createdAt',
    status: '',
    page: 1,
    limit: 10
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProjects(filters);
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (projectData) => {
    try {
      const response = await createProject(projectData);
      setProjects(prev => [response.data, ...prev]);
      toast.success('Project created successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
      throw err;
    }
  };

  const removeProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
      throw err;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    projects,
    loading,
    error,
    filters,
    addProject,
    removeProject,
    updateFilters,
    refetch: fetchProjects
  };
};