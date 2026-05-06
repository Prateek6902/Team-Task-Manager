import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar,
  Chip, TextField, InputAdornment, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Paper
} from '@mui/material';
import {
  People, Search, Email, AdminPanelSettings, Person,
  Group, Add, Groups
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as userService from '../services/userService';
import * as teamService from '../services/teamService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('members'); // 'members' or 'teams'
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', department: 'Development' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, teamsResponse] = await Promise.all([
        userService.getUsers(),
        teamService.getTeams()
      ]);
      
      // Handle users data
      let usersData = [];
      if (usersResponse.data) {
        usersData = usersResponse.data;
      } else if (usersResponse.users) {
        usersData = usersResponse.users;
      } else if (Array.isArray(usersResponse)) {
        usersData = usersResponse;
      }
      setMembers(Array.isArray(usersData) ? usersData : []);

      // Handle teams data
      let teamsData = [];
      if (teamsResponse.data) {
        teamsData = teamsResponse.data;
      } else if (teamsResponse.teams) {
        teamsData = teamsResponse.teams;
      } else if (Array.isArray(teamsResponse)) {
        teamsData = teamsResponse;
      }
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      
      console.log('Members loaded:', usersData.length);
      console.log('Teams loaded:', teamsData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show error toast if it's just empty data
      setMembers([]);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      if (!newTeam.name.trim()) {
        toast.error('Team name is required');
        return;
      }
      await teamService.createTeam(newTeam);
      toast.success('Team created successfully!');
      setOpenTeamDialog(false);
      setNewTeam({ name: '', description: '', department: 'Development' });
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const filteredMembers = members.filter(member => {
    if (!member) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.department?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower)
    );
  });

  const departments = ['Development', 'Testing', 'Marketing', 'Design', 'HR', 'Management', 'Sales', 'Support'];

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
                Team Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {members.length} members · {teams.length} teams
              </Typography>
            </Box>
            {user?.role === 'admin' && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={viewMode === 'members' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('members')}
                  startIcon={<People />}
                >
                  Members
                </Button>
                <Button
                  variant={viewMode === 'teams' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('teams')}
                  startIcon={<Groups />}
                >
                  Teams
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenTeamDialog(true)}
                  sx={{ background: 'linear-gradient(45deg, #6C63FF, #FF6B6B)' }}
                >
                  New Team
                </Button>
              </Box>
            )}
          </Box>
        </motion.div>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={`Search ${viewMode === 'members' ? 'members' : 'teams'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
          }}
        />
      </Paper>

      {/* Members View */}
      {viewMode === 'members' && (
        <>
          {filteredMembers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <People sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No members match your search' : 'No team members yet'}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Register new users to see them here
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={4} key={member._id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, fontSize: '2rem', bgcolor: 'primary.main' }}>
                          {member.name?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {member.name || 'Unknown'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, my: 1 }}>
                          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {member.email || 'No email'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
                          <Chip
                            icon={member.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                            label={member.role === 'admin' ? 'Admin' : 'Member'}
                            color={member.role === 'admin' ? 'warning' : 'primary'}
                            size="small"
                          />
                          {member.department && (
                            <Chip label={member.department} size="small" variant="outlined" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Teams View */}
      {viewMode === 'teams' && (
        <>
          {teams.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Groups sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No teams created yet</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
                Create teams to organize your members
              </Typography>
              {user?.role === 'admin' && (
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenTeamDialog(true)}>
                  Create First Team
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {teams.map((team, index) => (
                <Grid item xs={12} sm={6} md={4} key={team._id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {team.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {team.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={team.department || 'General'} size="small" color="primary" />
                          <Chip 
                            icon={<People />} 
                            label={`${team.members?.length || 0} members`} 
                            size="small" 
                            variant="outlined" 
                            />
                        </Box>
                        {team.teamLead && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Lead: {team.teamLead?.name || 'N/A'}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Create Team Dialog (Admin Only) */}
      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Groups color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Create New Team</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth label="Team Name" value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              required sx={{ mb: 3 }}
            />
            <TextField
              fullWidth label="Description" value={newTeam.description}
              onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              multiline rows={3} sx={{ mb: 3 }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={newTeam.department}
                onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                label="Department"
              >
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTeam} disabled={!newTeam.name.trim()}>
            Create Team
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
