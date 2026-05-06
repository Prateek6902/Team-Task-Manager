import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Paper, TextField, Button, Typography, Link,
  InputAdornment, IconButton, Alert, CircularProgress,
  Stepper, Step, StepLabel, useMediaQuery, useTheme,
  FormControl, InputLabel, Select, MenuItem, RadioGroup,
  FormControlLabel, Radio, Chip
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, Person,
  ArrowForward, WorkOutline, ArrowBack, Badge,
  Groups, Dashboard
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',         // NEW: Role selection
    department: 'Development', // NEW: Department
    designation: '',
    employeeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = ['Account Details', 'Role & Team', 'Security'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.name || !formData.email) {
        setError('Please fill all fields');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email');
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.department) {
        setError('Please select a department');
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.department,
      designation: formData.designation,
      employeeId: formData.employeeId
    });

    if (result.success) {
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const departments = [
    { value: 'Development', icon: '💻', color: '#6C63FF' },
    { value: 'Testing', icon: '🧪', color: '#4CAF50' },
    { value: 'Marketing', icon: '📢', color: '#FF6B6B' },
    { value: 'Design', icon: '🎨', color: '#FFA726' },
    { value: 'HR', icon: '👥', color: '#29B6F6' },
    { value: 'Management', icon: '📊', color: '#AB47BC' },
    { value: 'Sales', icon: '💼', color: '#26A69A' },
    { value: 'Support', icon: '🎧', color: '#EF5350' }
  ];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth label="Full Name" name="name"
              value={formData.name} onChange={handleChange}
              required sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>
              }}
            />
            <TextField
              fullWidth label="Email Address" name="email"
              type="email" value={formData.email}
              onChange={handleChange} required sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>
              }}
            />
            <TextField
              fullWidth label="Employee ID (Optional)" name="employeeId"
              value={formData.employeeId} onChange={handleChange}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Badge color="action" /></InputAdornment>
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            {/* Role Selection */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge /> Select Your Role
            </Typography>
            <RadioGroup
              name="role"
              value={formData.role}
              onChange={handleChange}
              sx={{ mb: 3 }}
            >
              <FormControlLabel 
                value="admin" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Administrator</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full access - Manage teams, projects, and users
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="member" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Team Member</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Team access - Work on assigned projects and tasks
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>

            {/* Department Selection */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups /> Select Department
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {departments.map((dept) => (
                <Chip
                  key={dept.value}
                  label={`${dept.icon} ${dept.value}`}
                  onClick={() => setFormData({ ...formData, department: dept.value })}
                  variant={formData.department === dept.value ? 'filled' : 'outlined'}
                  color={formData.department === dept.value ? 'primary' : 'default'}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>
                    {dept.icon} {dept.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth label="Designation (Optional)" name="designation"
              value={formData.designation} onChange={handleChange}
              placeholder="e.g., Senior Developer, QA Lead"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Badge color="action" /></InputAdornment>
              }}
            />
          </>
        );
      case 2:
        return (
          <>
            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange}
              required sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth label="Confirm Password" name="confirmPassword"
              type="password" value={formData.confirmPassword}
              onChange={handleChange} required sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>
              }}
            />
            <Box sx={{ bgcolor: 'info.main', color: 'white', p: 2, borderRadius: 2, mb: 2 }}>
              <Typography variant="caption">
                🔒 Password must be at least 6 characters long
              </Typography>
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <motion.div style={{
        position: 'absolute', width: '100%', height: '100%',
        background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
      }} animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />

      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Paper elevation={24} sx={{
            p: isMobile ? 3 : 5, borderRadius: 4,
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                <WorkOutline sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              </motion.div>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Create Account</Typography>
              <Typography variant="body1" color="text.secondary">
                Join your team and start managing tasks
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBack />}>
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === steps.length - 1 ? (
                  <Button type="submit" variant="contained" size="large" disabled={loading} endIcon={<ArrowForward />}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>Next</Button>
                )}
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;
