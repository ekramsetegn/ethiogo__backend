
const bcrypt = require('bcryptjs');
const pool = require('./db');
const dotenv = require('dotenv');
dotenv.config();

const insertAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!email || !plainPassword) {
    console.error(' ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    const [existing] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(' Admin already exists');
      process.exit();
    }

    await pool.execute('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
    console.log(' Admin inserted from .env!');
    process.exit();
  } catch (err) {
    console.error(' Failed to insert admin:', err);
    process.exit(1);
  }
};

insertAdmin();
