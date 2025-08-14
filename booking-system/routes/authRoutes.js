// Defines the API routes for user authentication.

const express = require('express');
const { register, login, getUserByEmail } = require('../controllers/authController');

const router = express.Router();

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// New Route to get a user by email
router.get('/users/:email', getUserByEmail);

module.exports = router;