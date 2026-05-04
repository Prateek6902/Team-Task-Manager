import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { People, Edit, Delete, Add, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as userService from '../services/userService';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'member', isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data || response.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id, formData);
        toast.success('User updated successfully');
      } else {
        await authService.registerUser({
          ...formData,
          password: 'password123'
        });
        toast.success('User created successfully');
      }
      fetchUsers();
      setOpenDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  // ... rest of your AdminPanel component stays the same ...
};

export default AdminPanel;
