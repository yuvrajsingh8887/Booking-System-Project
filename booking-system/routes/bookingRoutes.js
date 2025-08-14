// Defines the API routes for managing bookings.

const express = require('express');
const { createBooking, getBookings, getBookingById, updateBooking, deleteBooking } = require('../controllers/bookingController');
const auth = require('../middleware/auth');

const router = express.Router();

// Route to create a new booking (requires authentication)
router.post('/', auth, createBooking);

// Route to get all bookings for the authenticated user
router.get('/', auth, getBookings);

// Route to get a specific booking by ID (requires authentication)
router.get('/:id', auth, getBookingById);

// Route to update a specific booking (requires authentication)
router.put('/:id', auth, updateBooking);

// Route to delete a specific booking (requires authentication)
router.delete('/:id', auth, deleteBooking);

module.exports = router;