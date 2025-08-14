// Manages the PostgreSQL database connection using the 'pg' library.

const { Pool } = require('pg');
const config = require('../config/config');

// Create a new Pool instance to manage database connections
const pool = new Pool({
    user: config.pgUser,
    host: config.pgHost,
    database: config.pgDatabase,
    password: config.pgPassword,
    port: config.pgPort,
});

pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Successfully connected to the PostgreSQL database.');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};