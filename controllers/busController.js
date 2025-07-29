const pool = require('../db');

const getAllBuses = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM buses');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching buses:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
const addBus = async (req, res) => {
  const { number, origin, destination, date, time, seats } = req.body;

  if (!number || !origin || !destination || !date || !time || !seats) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await pool.execute(
      'INSERT INTO buses (number, origin, destination, date, time, seats) VALUES (?, ?, ?, ?, ?, ?)',
      [number, origin, destination, date, time, seats]
    );

    res.json({ message: ' Bus added successfully!' });
  } catch (err) {
    console.error('Error adding bus:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteBus = async (req, res) => {
  const busId = req.params.id;

  try {
    await pool.execute('DELETE FROM buses WHERE id = ?', [busId]);
    res.json({ message: ' Bus deleted successfully' });
  } catch (err) {
    console.error(' Failed to delete bus:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

  const updateBus = async (req, res) => {
  const busId = req.params.id;
  const { number, origin, destination, date, time, seats } = req.body;

  try {
    await pool.execute(
      `UPDATE buses SET number=?, origin=?, destination=?, date=?, time=?, seats=? WHERE id=?`,
      [number, origin, destination, date, time, seats, busId]
    );
    res.json({ message: ' Bus updated successfully!' });
  } catch (err) {
    console.error(' Failed to update bus:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
  


module.exports = { getAllBuses, addBus, deleteBus, updateBus };

