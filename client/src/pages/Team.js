import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar,
  Chip, TextField, InputAdornment, CircularProgress
} from '@mui/material';
import { People, Search, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as userService from '../services/userService';
import toast from 'react-hot-toast';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
  try {
    setLoading(true);

    const res = await userService.getUsers();
    const data = res.data || res;

    setMembers(Array.isArray(data) ? data : []);

  } catch (error) {
    console.error('Error fetching team:', error);
    toast.error('Failed to load team members');
    setMembers([]);
  } finally {
    setLoading(false);
  }
};

  // ... rest of your Team component stays the same ...
};

export default Team;
