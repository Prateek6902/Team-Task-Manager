import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Switch,
  FormControlLabel, Button, Divider, Grid, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  DarkMode, LightMode, Notifications, Language,
  Palette
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState({
    darkMode: darkMode || false,
    notifications: true,
    emailNotifications: true,
    language: 'english',
    taskReminders: true
  });

  const handleChange = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [key]: value });
    
    if (key === 'darkMode') {
      setDarkMode(value);
      toast.success(`${value ? 'Dark' : 'Light'} mode activated`);
    }
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Settings</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Customize your application experience
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Palette color="primary" />
                  <Typography variant="h6">Appearance</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={handleChange('darkMode')}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {settings.darkMode ? <DarkMode /> : <LightMode />}
                      <Typography>Dark Mode</Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Notifications color="primary" />
                  <Typography variant="h6">Notifications</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <FormControlLabel
                  control={<Switch checked={settings.notifications} onChange={handleChange('notifications')} color="primary" />}
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={<Switch checked={settings.emailNotifications} onChange={handleChange('emailNotifications')} color="primary" />}
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={<Switch checked={settings.taskReminders} onChange={handleChange('taskReminders')} color="primary" />}
                  label="Task Reminders"
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Language color="primary" />
                  <Typography variant="h6">Language</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={handleChange('language')}
                    label="Language"
                  >
                    <MenuItem value="english">English</MenuItem>
                    <MenuItem value="spanish">Spanish</MenuItem>
                    <MenuItem value="french">French</MenuItem>
                    <MenuItem value="german">German</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined">Reset to Default</Button>
              <Button variant="contained" onClick={handleSave}>Save Settings</Button>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;