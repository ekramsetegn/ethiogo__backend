const pool = require('./db');

const createBusesTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS buses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number VARCHAR(50),
        origin VARCHAR(100),
        destination VARCHAR(100),
        date DATE,
        time TIME,
        seats INT
      )
    `);

    console.log(' buses table created (or already exists)');
    process.exit();
  } catch (err) {
    console.error(' Error creating buses table:', err);
    process.exit(1);
  }
};

createBusesTable();
