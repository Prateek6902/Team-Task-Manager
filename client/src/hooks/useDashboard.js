import { useState, useEffect, useCallback } from 'react';
import * as dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      setData(response.data || response);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load dashboard';
      setError(errorMsg);
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard
  };
};