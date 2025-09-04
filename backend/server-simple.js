const express = require('express');
const path = require('path');

const app = express();

// --- serve static legal pages (Privacy / Terms) ---
// Serve ./public as static (for privacy/terms)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
}));

// Friendly shortcuts
app.get('/privacy', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'))
);
app.get('/terms', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'terms.html'))
);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dreams KSA Voice Chat Backend - Simple Version',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Simple route map
app.get('/routes', (_req, res) => {
  res.json({
    routes: [
      'GET /',
      'GET /health',
      'GET /routes',
      'GET /privacy',
      'GET /terms'
    ]
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Dreams KSA Backend Server listening on ${HOST}:${PORT}`);
  console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
});

// Final JSON 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});
