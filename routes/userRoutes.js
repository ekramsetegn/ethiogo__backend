const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const isEmailValid = require('../emailValidator');
const { loginUser } = require('../controllers/userController');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const isValid = await isEmailValid(email);
    if (!isValid) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(' Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});


router.post('/login', loginUser);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name, email
      FROM users
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(' Error fetching users:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

module.exports = router;
