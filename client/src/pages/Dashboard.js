import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import {
  Assignment, Folder, People, TrendingUp
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as dashboardService from '../services/dashboardService';
import {
  PieChart3D, AreaChart3D, BarChart3D,
  LineChart3D, DonutChart3D
} from '../components/dashboard/Charts3D';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState([]);
  const [tasksByPriority, setTasksByPriority] = useState([]);
  const [teamWorkload, setTeamWorkload] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      const data = response.data || response;
      
      setStats(data.stats || {});
      setWeeklyData(data.weeklyData || []);
      setTasksByStatus(data.tasksByStatus || []);
      setTasksByPriority(data.tasksByPriority || []);
      setRecentTasks(data.recentTasks || []);
      setProjectStatusData(data.projectStatusData || []);

      // Transform team stats for bar chart
      setTeamWorkload(
        (data.teamStats || []).map(member => ({
          name: member.user?.name || 'Unknown',
          total: member.totalTasks || 0,
          completed: member.completedTasks || 0
        }))
      );

      // Department performance data (mock or from API)
      setDepartmentPerformance([
        { name: 'Development', value: 85, color: '#6C63FF' },
        { name: 'Testing', value: 72, color: '#4CAF50' },
        { name: 'Marketing', value: 65, color: '#FF6B6B' },
        { name: 'Design', value: 78, color: '#FFA726' },
        { name: 'HR', value: 90, color: '#29B6F6' }
      ]);

    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: '1px solid', borderColor: `${color}30`
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" color="text.secondary">{title}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{value}</Typography>
              {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
            <Avatar sx={{ bgcolor: color, width: 50, height: 50 }}>{icon}</Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time project analytics with 3D visualizations
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Projects" value={stats.totalProjects || 0} icon={<Folder />} color="#6C63FF" delay={0.1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Tasks" value={stats.totalTasks || 0} icon={<Assignment />} color="#FF6B6B" delay={0.2} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Productivity" value={`${stats.productivity || 0}%`} icon={<TrendingUp />} color="#4CAF50" delay={0.3} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Team Members" value={stats.teamMembers || 0} icon={<People />} color="#FFA726" delay={0.4} />
        </Grid>
      </Grid>

      {/* 3D Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pie Chart - Task Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <PieChart3D data={tasksByStatus} title="Task Status Distribution" />
            </CardContent>
          </Card>
        </Grid>

        {/* Area Chart - Productivity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <AreaChart3D data={weeklyData} title="Productivity Trends" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Bar Chart - Team Workload */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <BarChart3D data={teamWorkload} title="Team Workload" />
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart - Weekly Completion */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <LineChart3D data={weeklyData} title="Weekly Completion Rate" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Donut Chart - Department Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <DonutChart3D data={departmentPerformance} title="Department Performance" />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Tasks</Typography>
              <List>
                {recentTasks.slice(0, 5).map((task, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: task.status === 'done' ? '#4CAF50' : '#6C63FF' }}>
                        <Assignment />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.title}
                      secondary={task.project?.name || 'No project'}
                    />
                    <Chip
                      label={task.status}
                      size="small"
                      color={task.status === 'done' ? 'success' : 'warning'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
