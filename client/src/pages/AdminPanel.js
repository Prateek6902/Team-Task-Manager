import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  People, Edit, Delete, Add, AdminPanelSettings, Person, Block
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api'; // ✅ FIXED
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ FIXED (no localhost, no axios)
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data || response);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'member',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  // ✅ FIXED
  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/auth/register', {
          ...formData,
          password: 'password123'
        });
        toast.success('User created successfully');
      }

      fetchUsers();
      setOpenDialog(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Operation failed');
    }
  };

  // ✅ FIXED
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Admin Panel
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage users and system settings
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Add User
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography color="text.secondary">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AdminPanelSettings sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => u.role === 'admin').length}
                  </Typography>
                  <Typography color="text.secondary">Admins</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Block sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => !u.isActive).length}
                  </Typography>
                  <Typography color="text.secondary">Inactive</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map(user => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Chip label={user.role} />
                </TableCell>

                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'error'}
                  />
                </TableCell>

                <TableCell>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : 'Never'}
                </TableCell>

                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(user)}>
                    <Edit />
                  </IconButton>

                  <IconButton color="error" onClick={() => handleDelete(user._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
