import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Warning,
  People,
  MoreVert,
  AccessTime,
  PriorityHigh
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import axios from 'axios';
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
      const response = await axios.get('http://localhost:5000/api/dashboard');
      setStats(response.data.stats);
      setRecentTasks(response.data.recentTasks);
      setChartData(response.data.chartData);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const taskStatusData = [
    { name: 'Completed', value: stats.completedTasks },
    { name: 'In Progress', value: stats.totalTasks - stats.completedTasks - stats.overdueTasks },
    { name: 'Overdue', value: stats.overdueTasks }
  ].filter(item => item.value > 0);

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

  const StatCard = ({ title, value, icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              {loading ? (
                <Skeleton width={60} height={40} />
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                  {value}
                </Typography>
              )}
            </Box>
            <Box sx={{ 
              backgroundColor: `${color}20`,
              borderRadius: 3,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                {icon}
              </Avatar>
            </Box>
          </Box>
          {!loading && (
            <LinearProgress
              variant="determinate"
              value={stats.productivity || 75}
              sx={{ mt: 2, height: 6, borderRadius: 3, backgroundColor: `${color}20` }}
              sx={{
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3,
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your projects.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<Folder />}
            color="#6C63FF"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Tasks"
            value={stats.totalTasks}
            icon={<Assignment />}
            color="#FF6B6B"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={<CheckCircle />}
            color="#4CAF50"
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Overdue"
            value={stats.overdueTasks}
            icon={<Warning />}
            color="#FFA726"
            delay={0.4}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Progress
                  </Typography>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="tasks"
                      stroke="#6C63FF"
                      fill="url(#colorGradient)"
                      strokeWidth={3}
                    />
                    <Tooltip />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Task Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Tasks
                  </Typography>
                  <Chip label="View All" color="primary" size="small" />
                </Box>

                <List>
                  {recentTasks.map((task, index) => (
                    <ListItem key={index} sx={{ 
                      px: 0,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: task.status === 'done' ? '#4CAF50' : task.priority === 'urgent' ? '#FF6B6B' : '#6C63FF' }}>
                          <Assignment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={`Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`}
                      />
                      <Box>
                        <Chip
                          label={task.status}
                          size="small"
                          color={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'warning' : 'default'}
                          sx={{ mr: 1 }}
                        />
                        {task.priority === 'urgent' && (
                          <Chip
                            icon={<PriorityHigh />}
                            label="Urgent"
                            size="small"
                            color="error"
                          />
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;