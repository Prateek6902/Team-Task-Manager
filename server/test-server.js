const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock auth endpoint for testing
app.post('/api/auth/register', (req, res) => {
  console.log('Register attempt:', req.body);
  res.json({
    success: true,
    token: 'test-token-123',
    user: {
      id: '1',
      name: req.body.name || 'Test User',
      email: req.body.email,
      role: 'member'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({
    success: true,
    token: 'test-token-123',
    user: {
      id: '1',
      name: 'Test User',
      email: req.body.email,
      role: 'admin'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Check for auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  res.json({
    success: true,
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      avatar: ''
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`Test the server: http://localhost:${PORT}/api/health`);
});