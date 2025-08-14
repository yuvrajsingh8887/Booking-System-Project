
const express = require('express');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = config.port;

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Booking System API is running!');
});

// Use the imported route handlers
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});