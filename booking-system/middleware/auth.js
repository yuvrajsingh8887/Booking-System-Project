// Middleware to authenticate requests using JWT.

const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Middleware function to check for a valid JWT token
const auth = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token is provided, return an error
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, config.jwtSecret);
        // Add the user ID from the token to the request object
        req.userId = decoded.userId;
        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // If token is invalid, return an error
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = auth;