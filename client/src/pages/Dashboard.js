import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress,
  Chip, Avatar, IconButton, List, ListItem, ListItemAvatar,
  ListItemText, Skeleton
} from '@mui/material';
import {
  TrendingUp, Assignment, CheckCircle, Warning, People,
  MoreVert, AccessTime, PriorityHigh, Folder
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { format } from 'date-fns';
import * as dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    teamMembers: 0,
    productivity: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);

    const res = await dashboardService.getDashboardData();

    const data = res.data || res;

    setStats(data.stats || {});
    setRecentTasks(data.recentTasks || []);
    setChartData(data.weeklyData || []);

  } catch (error) {
    console.error('Dashboard error:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  // ... rest of your Dashboard component stays the same ...
};

export default Dashboard;
