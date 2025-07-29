const pool = require('../db');
const PDFDocument = require('pdfkit');

const createBooking = async (req, res) => {
  const { userId, busId, seatCount } = req.body;
  if (!userId || !busId || !seatCount) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [busRows] = await pool.execute('SELECT seats FROM buses WHERE id = ?', [busId]);
    const bus = busRows[0];
    if (!bus || bus.seats < seatCount) {
      return res.status(400).json({ error: 'Not enough seats' });
    }

    await pool.execute(
      'INSERT INTO bookings (user_id, bus_id, seat_count, booked_at) VALUES (?, ?, ?, NOW())',
      [userId, busId, seatCount]
    );
    await pool.execute('UPDATE buses SET seats = seats - ? WHERE id = ?', [seatCount, busId]);

    res.json({ message: 'Booking confirmed!' });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


const getUserBookings = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.execute(`
      SELECT bk.id, b.number AS busNumber, b.origin, b.destination, b.date, b.time,
             bk.booked_at, bk.passenger_name, bk.gender, bk.phone, bk.seat_number
      FROM bookings bk
      JOIN buses b ON bk.bus_id = b.id
      WHERE bk.user_id = ?
      ORDER BY bk.booked_at DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Handle payment
const handlePayment = async (req, res) => {
  const { busId, passengers, bank, phone, verificationCode, totalAmount, userId } = req.body;

  if (!busId || !Array.isArray(passengers) || passengers.length === 0 || !bank || !phone || !verificationCode || !userId) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const p of passengers) {
      const { name, gender, phone: passengerPhone, seatNumber } = p;

      const [existing] = await conn.execute(
        'SELECT id FROM bookings WHERE bus_id = ? AND seat_number = ?',
        [busId, seatNumber]
      );
      if (existing.length > 0) throw new Error(`Seat ${seatNumber} already booked.`);

      await conn.execute(
        `INSERT INTO bookings (
          user_id, bus_id, seat_count, passenger_name, gender, phone, seat_number,
          paid, payment_method, bank_name, payment_amount, booked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          busId,
          1,
          name,
          gender,
          passengerPhone,
          seatNumber,
          true,
          bank,
          bank,
          totalAmount,
        ]
      );
    }

    await conn.execute('UPDATE buses SET seats = seats - ? WHERE id = ?', [passengers.length, busId]);
    await conn.commit();
    res.status(200).json({ message: 'Payment and booking complete' });
  } catch (err) {
    await conn.rollback();
    console.error('Payment error:', err.message);
    res.status(500).json({ error: err.message || 'Payment failed' });
  } finally {
    conn.release();
  }
};



const generateBookingPDF = async (req, res) => {
  const { bookingId } = req.params;
  console.log(' Generating PDF for booking:', bookingId);

  try {
    const [rows] = await pool.execute(
      `SELECT bk.*, b.number AS busNumber, b.origin, b.destination, b.date, b.time
       FROM bookings bk
       JOIN buses b ON bk.bus_id = b.id
       WHERE bk.id = ?`,
      [bookingId]
    );

    if (rows.length === 0) return res.status(404).send('Booking not found');

    const booking = rows[0];
res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${bookingId}.pdf`);

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text(' Bus Booking Receipt', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Booking ID: ${booking.id}`);
    doc.text(`Passenger: ${booking.passenger_name}`);
    doc.text(`Gender: ${booking.gender}`);
    doc.text(`Phone: ${booking.phone}`);
    doc.text(`Seat No: ${booking.seat_number}`);
    doc.moveDown();
    doc.text(`Bus Number: ${booking.busNumber}`);
    doc.text(`Route: ${booking.origin} ➡ ${booking.destination}`);
    doc.text(`Date: ${new Date(booking.date).toLocaleDateString()}`);
    doc.text(`Time: ${booking.time}`);
    doc.moveDown();
    doc.text(`Payment Method: ${booking.payment_method}`);
    doc.text(`Bank: ${booking.bank_name}`);
    doc.text(`Amount Paid: ${booking.payment_amount} ETB`);
    doc.text(`Booked At: ${new Date(booking.booked_at).toLocaleString()}`);

    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).send('Error generating receipt');
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  handlePayment,
  generateBookingPDF,
};
