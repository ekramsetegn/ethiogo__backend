const pool = require('./db');

const init = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255)
      )
    `);
    
    console.log(' Users table created or already exists.');
    process.exit();
  } catch (err) {
    console.error('Failed to create table:', err);
    process.exit(1);
  }
};

init();
