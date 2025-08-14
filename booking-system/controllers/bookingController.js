
const db = require('../database/db');
const axios = require('axios');

const VALIDATOR_URL = 'http://localhost:4567';

// Helper function to handle validation calls
const validateWithService = async (endpoint, data) => {
    try {
        await axios.post(`${VALIDATOR_URL}${endpoint}`, data);
        return { valid: true, error: null };
    } catch (error) {
        if (error.response && error.response.data) {
            return { valid: false, error: error.response.data.error };
        }
        console.error('Validation service error:', error.message);
        throw new Error('Validation service is unavailable. Please try again later.');
    }
};

exports.createBooking = async (req, res) => {
    try {
        // Validate with the Groovy service
        const validation = await validateWithService('/validate/booking/create', req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        
        const { resource_name, start_time, end_time } = req.body;
        const userId = req.userId;

        const queryText = 'INSERT INTO bookings(user_id, resource_name, start_time, end_time) VALUES($1, $2, $3, $4) RETURNING *';
        const result = await db.query(queryText, [userId, resource_name, start_time, end_time]);
        const newBooking = result.rows[0];

        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (err) {
        if (err.message.includes('Validation service is unavailable')) {
            return res.status(503).json({ error: err.message });
        }
        console.error('Booking creation error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Validate with the Groovy service
        const validation = await validateWithService('/validate/booking/update', req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const findQuery = 'SELECT * FROM bookings WHERE id = $1 AND user_id = $2';
        const findResult = await db.query(findQuery, [id, userId]);
        if (findResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found or you do not have permission to update it' });
        }

        const updates = req.body;
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');

        const updateQuery = `UPDATE bookings SET ${setClause} WHERE id = $1 AND user_id = $2 RETURNING *`;
        const result = await db.query(updateQuery, [id, userId, ...values]);

        const updatedBooking = result.rows[0];
        res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
    } catch (err) {
        if (err.message.includes('Validation service is unavailable')) {
            return res.status(503).json({ error: err.message });
        }
        console.error('Booking update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


// Function to handle getting all bookings for the logged-in user
exports.getBookings = async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from the authenticated token

        // Query the database for all bookings by the user
        const queryText = 'SELECT id, resource_name, start_time, end_time, created_at FROM bookings WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await db.query(queryText, [userId]);
        const bookings = result.rows;

        res.status(200).json({ message: 'Bookings retrieved successfully', bookings });
    } catch (err) {
        console.error('Get bookings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


// Function to handle getting a single booking by its ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params; // Get booking ID from URL parameters
        const userId = req.userId; // Get user ID from the authenticated token

        const queryText = 'SELECT id, resource_name, start_time, end_time, created_at FROM bookings WHERE id = $1 AND user_id = $2';
        const result = await db.query(queryText, [id, userId]);
        const booking = result.rows[0];

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or you do not have permission to view it' });
        }

        res.status(200).json({ message: 'Booking retrieved successfully', booking });
    } catch (err) {
        console.error('Get booking by ID error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


// Function to handle deleting an existing booking
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params; // Get booking ID from URL parameters
        const userId = req.userId; // Get user ID from the authenticated token

        // Find the booking to ensure it exists and belongs to the user
        const findQuery = 'SELECT * FROM bookings WHERE id = $1 AND user_id = $2';
        const findResult = await db.query(findQuery, [id, userId]);
        if (findResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found or you do not have permission to delete it' });
        }

        // Delete the booking from the database
        const deleteQuery = 'DELETE FROM bookings WHERE id = $1 AND user_id = $2 RETURNING id';
        const result = await db.query(deleteQuery, [id, userId]);

        res.status(200).json({ message: 'Booking deleted successfully', booking_id: result.rows[0].id });
    } catch (err) {
        console.error('Booking deletion error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};