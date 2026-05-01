// Sabse pehle dotenv config karo
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

// Phir baaki imports
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow Chrome extension
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'AI Gmail Assistant Backend is running with Groq AI',
    aiProvider: process.env.GROQ_API_KEY ? 'Groq (Configured ✅)' : 'Groq (Not Configured ❌)'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  if (process.env.GROQ_API_KEY) {
    console.log(`🤖 Groq AI: Configured ✅ (Free Tier - 14,400 requests/day)`);
  } else {
    console.log(`⚠️  Groq API key missing. Add GROQ_API_KEY to .env file`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});