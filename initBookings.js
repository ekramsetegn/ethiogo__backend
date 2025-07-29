const pool = require('./db');

const createBookingsTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        bus_id INT,
        seat_count INT,
        booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log(' bookings table created!');
    process.exit();
  } catch (err) {
    console.error(' Error creating bookings table:', err);
    process.exit(1);
  }
};

createBookingsTable();
