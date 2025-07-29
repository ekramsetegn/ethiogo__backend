const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await pool.execute(
      'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
