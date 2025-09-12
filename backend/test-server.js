// Minimal test server for debugging
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});

module.exports = app;
