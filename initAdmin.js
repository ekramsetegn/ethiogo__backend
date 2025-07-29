const pool = require('./db');

const init = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255)
      )
    `);
    console.log(' Admins table created or already exists.');
    process.exit();
  } catch (err) {
    console.error(' Failed to create admin table:', err);
    process.exit(1);
  }
};

init();
