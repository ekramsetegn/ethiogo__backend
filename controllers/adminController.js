const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        isAdmin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { loginAdmin };
