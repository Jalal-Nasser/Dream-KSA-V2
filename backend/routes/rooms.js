const express = require('express');
const router = express.Router();

// Basic rooms router - can be expanded later
router.get('/', (req, res) => {
  res.json({ message: 'Rooms endpoint' });
});

module.exports = router;
