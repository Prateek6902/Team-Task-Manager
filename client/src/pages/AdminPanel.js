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
name: '',
email: '',
role: 'member',
isActive: true
});

useEffect(() => {
fetchUsers();
}, []);

// ================= FETCH USERS =================
const fetchUsers = async () => {
try {
setLoading(true);
const res = await userService.getUsers();


  // ✅ FIXED RESPONSE HANDLING
  setUsers(res.data || res.users || []);

} catch (error) {
  console.error(error);
  toast.error('Failed to load users');
} finally {
  setLoading(false);
}

};

// ================= OPEN DIALOG =================
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

// ================= SUBMIT =================
const handleSubmit = async () => {
try {
if (editingUser) {
await userService.updateUser(editingUser._id, formData);
toast.success('User updated successfully');
} else {
// ✅ FIXED FUNCTION NAME
await authService.register({
...formData,
password: 'password123'
});
toast.success('User created successfully');
}


  fetchUsers();
  setOpenDialog(false);

} catch (error) {
  console.error(error);
  toast.error(error?.response?.data?.message || 'Operation failed');
}


};

// ================= DELETE =================
const handleDelete = async (userId) => {
if (!window.confirm('Are you sure you want to delete this user?')) return;


try {
  await userService.deleteUser(userId);
  toast.success('User deleted successfully');
  fetchUsers();
} catch (error) {
  console.error(error);
  toast.error('Failed to delete user');
}


};

if (loading) {
return <Typography>Loading users...</Typography>;
}

return ( <Box>
{/* Header */}
<Box sx={{ mb: 4 }}>
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
<Box sx={{ display: 'flex', justifyContent: 'space-between' }}> <Typography variant="h4" fontWeight={700}>
Admin Panel </Typography>


        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>
    </motion.div>
  </Box>

  {/* Users Table */}
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Person />
                {user.name}
              </Box>
            </TableCell>

            <TableCell>{user.email}</TableCell>

            <TableCell>
              <Chip
                label={user.role}
                color={user.role === 'admin' ? 'primary' : 'default'}
                size="small"
              />
            </TableCell>

            <TableCell>
              <Chip
                label={user.isActive ? 'Active' : 'Inactive'}
                color={user.isActive ? 'success' : 'error'}
                size="small"
              />
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
    <DialogTitle>
      {editingUser ? 'Edit User' : 'Add User'}
    </DialogTitle>

    <DialogContent>
      <TextField
        fullWidth
        label="Name"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth>
        <InputLabel>Role</InputLabel>
        <Select
          value={formData.role}
          label="Role"
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value })
          }
        >
          <MenuItem value="member">Member</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>
    </DialogContent>

    <DialogActions>
      <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
      <Button variant="contained" onClick={handleSubmit}>
        {editingUser ? 'Update' : 'Create'}
      </Button>
    </DialogActions>
  </Dialog>
</Box>


);
};

export default AdminPanel;
