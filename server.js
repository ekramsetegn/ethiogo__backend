
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); 

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');


const app = express(); 
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Disposition'] 
}));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});



