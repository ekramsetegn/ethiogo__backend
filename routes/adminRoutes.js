const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const pool = require('../db');
router.post('/login', loginAdmin);


router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
