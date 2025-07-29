const express = require('express');
const router = express.Router();
const pool = require('../db'); 

router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
 
    const [bookings] = await pool.query(
      `SELECT b.id AS bookingId, b.busId, b.total_amount, b.payment_status, bus.number, bus.origin, bus.destination, bus.date, bus.time,
              p.name AS passengerName, p.gender, p.phone AS passengerPhone, p.seatNumber
       FROM bookings b
       JOIN buses bus ON b.busId = bus.id
       JOIN passengers p ON p.bookingId = b.id
       WHERE b.userId = ?`,
      [userId]
    );

    if (!bookings.length) return res.status(404).json({ message: 'No bookings found' });
    const grouped = {};
    bookings.forEach((row) => {
      if (!grouped[row.bookingId]) {
        grouped[row.bookingId] = {
          bookingId: row.bookingId,
          busId: row.busId,
          totalAmount: row.total_amount,
          paymentStatus: row.payment_status,
          busNumber: row.number,
          origin: row.origin,
          destination: row.destination,
          date: row.date,
          time: row.time,
          passengers: [],
        };
      }
      grouped[row.bookingId].passengers.push({
        name: row.passengerName,
        gender: row.gender,
        phone: row.passengerPhone,
        seatNumber: row.seatNumber,
      });
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/pay', async (req, res) => {
  const { busId, passengers, bank, phone, verificationCode, totalAmount } = req.body;

  if (!busId || !passengers || !Array.isArray(passengers) || !bank || !phone || !verificationCode || !totalAmount) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
     
    if (verificationCode.length < 4 || verificationCode.length > 6) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    const userId = req.user?.id || 1; 

    //  Insert booking
    const [bookingResult] = await pool.query(
      `INSERT INTO bookings (userId, busId, total_amount, payment_status, bank, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, busId, totalAmount, 'paid', bank, phone]
    );

    const bookingId = bookingResult.insertId;

  
    for (const passenger of passengers) {
      const { name, gender, phone, seatNumber } = passenger;
      await pool.query(
        `INSERT INTO passengers (bookingId, name, gender, phone, seatNumber) VALUES (?, ?, ?, ?, ?)`,
        [bookingId, name, gender, phone, seatNumber]
      );
    }
    
   
    const newSeats = passengers.map(p => `'${p.seatNumber}'`).join(',');
    await pool.query(
      `UPDATE buses SET bookedSeats = CONCAT_WS(',', IFNULL(bookedSeats, ''), ${newSeats}) WHERE id = ?`,
      [busId]
    );

    res.json({ message: 'Payment and booking successful.' });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Server error while processing payment.' });
  }
});

module.exports = router;
