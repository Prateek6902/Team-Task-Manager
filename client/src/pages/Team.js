import { Paper } from '@mui/material';
import { Group, AdminPanelSettings, Person } from '@mui/icons-material';
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
    const data = res.data.data || [];

    setMembers(data);

  } catch (error) {
    console.error('Error fetching team:', error);
    toast.error('Failed to load team members');
    setMembers([]);
  } finally {
    setLoading(false);
  }
};
  
  const filteredMembers = members.filter(member => {
    if (!member) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower)
    );
  });

  const admins = filteredMembers.filter(m => m.role === 'admin');
  const regularMembers = filteredMembers.filter(m => m.role === 'member');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Team Members
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {members.length} {members.length === 1 ? 'member' : 'members'} in your team
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search team members by name, email or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Team Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Group sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{members.length}</Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <AdminPanelSettings sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{admins.length}</Typography>
              <Typography variant="caption" color="text.secondary">Admins</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Person sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{regularMembers.length}</Typography>
              <Typography variant="caption" color="text.secondary">Members</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <People sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{members.filter(m => m.isActive).length}</Typography>
              <Typography variant="caption" color="text.secondary">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <People sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No members match your search' : 'No team members found'}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            {searchTerm ? 'Try a different search term' : 'Team members will appear here'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Admins Section */}
          {admins.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettings color="warning" /> Administrators ({admins.length})
              </Typography>
              <Grid container spacing={3}>
                {admins.map((member, index) => (
                  <Grid item xs={12} sm={6} md={4} key={member._id || index}>
                    <MemberCard member={member} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Members Section */}
          {regularMembers.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="info" /> Members ({regularMembers.length})
              </Typography>
              <Grid container spacing={3}>
                {regularMembers.map((member, index) => (
                  <Grid item xs={12} sm={6} md={4} key={member._id || index}>
                    <MemberCard member={member} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

// Member Card Component
const MemberCard = ({ member, index }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['#6C63FF', '#FF6B6B', '#4CAF50', '#FFA726', '#29B6F6', '#AB47BC', '#26A69A', '#EF5350'];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              fontSize: '1.75rem',
              fontWeight: 600,
              bgcolor: getAvatarColor(member.name),
              border: '3px solid',
              borderColor: 'background.paper',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {getInitials(member.name)}
          </Avatar>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {member.name || 'Unknown User'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {member.email || 'No email'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Chip
              icon={member.role === 'admin' ? <AdminPanelSettings /> : <Person />}
              label={member.role === 'admin' ? 'Admin' : 'Member'}
              color={member.role === 'admin' ? 'warning' : 'primary'}
              size="small"
            />
            <Chip
              label={member.isActive !== false ? 'Active' : 'Inactive'}
              color={member.isActive !== false ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Team;

  // ... rest of your Team component stays the same ...
