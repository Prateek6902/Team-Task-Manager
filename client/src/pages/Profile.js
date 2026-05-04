import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Avatar, Tabs, Tab
} from '@mui/material';
import { Person, Edit, Save, Lock } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api'; // ✅ FIXED
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ FIXED (no axios, no localhost)
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);

      await api.put('/auth/updatedetails', formData);

      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED
  const handleChangePassword = async () => {
    try {
      setLoading(true);

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      await api.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password updated successfully');

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Profile
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Manage your account
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>

              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="Profile" icon={<Person />} />
                <Tab label="Password" icon={<Lock />} />
              </Tabs>

              {/* PROFILE TAB */}
              {tabValue === 0 && (
                <Box mt={3}>
                  <Button
                    onClick={() => editing ? handleUpdateProfile() : setEditing(true)}
                    startIcon={editing ? <Save /> : <Edit />}
                    variant={editing ? 'contained' : 'outlined'}
                    disabled={loading}
                  >
                    {editing ? 'Save' : 'Edit'}
                  </Button>

                  <TextField
                    fullWidth
                    label="Name"
                    sx={{ mt: 2 }}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!editing}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    sx={{ mt: 2 }}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!editing}
                  />
                </Box>
              )}

              {/* PASSWORD TAB */}
              {tabValue === 1 && (
                <Box mt={3}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    sx={{ mb: 2 }}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    sx={{ mb: 2 }}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm Password"
                    sx={{ mb: 2 }}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    Update Password
                  </Button>
                </Box>
              )}

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
