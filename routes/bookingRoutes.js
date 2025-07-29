const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  handlePayment,
  generateBookingPDF,
} = require('../controllers/bookingController');
const pool = require('../db');

router.post('/', createBooking);

router.get('/user/:userId', getUserBookings);

router.post('/pay', handlePayment);

router.delete('/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  try {
    await pool.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.sendStatus(500);
  }
});

router.get('/bus/:busId/seats', async (req, res) => {
  const { busId } = req.params;
  const pool = require('../db');

  try {
    const [rows] = await pool.execute(
      'SELECT seat_number FROM bookings WHERE bus_id = ?',
      [busId]
    );
    const bookedSeats = rows.map(row => row.seat_number);
    res.json(bookedSeats);
  } catch (err) {
    console.error('Error fetching booked seats:', err);
    res.status(500).json({ error: 'Failed to fetch booked seats' });
  }
});

router.get('/:bookingId/receipt', generateBookingPDF);
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT bk.*, b.number AS busNumber, b.origin, b.destination, b.date, b.time
      FROM bookings bk
      JOIN buses b ON bk.bus_id = b.id
      ORDER BY bk.booked_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT bk.id, bk.passenger_name, bk.phone, bk.seat_number, 
             b.number AS busNumber, b.origin, b.destination, b.date, b.time
      FROM bookings bk
      JOIN buses b ON bk.bus_id = b.id
      ORDER BY bk.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

module.exports = router;
