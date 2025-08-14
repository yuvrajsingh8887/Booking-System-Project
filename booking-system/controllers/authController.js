
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const db = require('../database/db');
const config = require('../config/config');
const axios = require('axios');

// The URL of your Groovy validation service
const VALIDATOR_URL = 'http://localhost:4567';

// Helper function to handle validation calls
const validateWithService = async (endpoint, data) => {
    try {
        await axios.post(`${VALIDATOR_URL}${endpoint}`, data);
        return { valid: true, error: null };
    } catch (error) {
        if (error.response && error.response.data) {
            // Validation error from the service (e.g., status 400)
            return { valid: false, error: error.response.data.error };
        }
        // Network or other server error
        console.error('Validation service error:', error.message);
        throw new Error('Validation service is unavailable. Please try again later.');
    }
};

exports.register = async (req, res) => {
    try {
        // Validate request body with the Groovy service
        const validation = await validateWithService('/validate/register', req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const queryText = 'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING id, name, email';
        const result = await db.query(queryText, [name, email, hashedPassword]);
        const newUser = result.rows[0];

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        // Check for specific validation service down error
        if (err.message.includes('Validation service is unavailable')) {
            return res.status(503).json({ error: err.message });
        }
        console.error('Registration error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Function to handle user login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const queryText = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(queryText, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const payload = { userId: user.id };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// New function to get a user by email
exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const queryText = 'SELECT id, name, email FROM users WHERE email = $1';
        const result = await db.query(queryText, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User found', user });
    } catch (err) {
        console.error('Get user by email error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};