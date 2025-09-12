const express = require('express');

const app = express();

app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), app: 'min-app' });
});

app.get('/', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), app: 'min-app' });
});

module.exports = app;
