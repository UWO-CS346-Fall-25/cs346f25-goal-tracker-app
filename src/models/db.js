/**
 * Database Connection
 *
 * This file sets up the PostgreSQL connection pool using the 'pg' library.
 * The pool manages multiple database connections efficiently.
 *
 * Usage:
 * const db = require('./models/db');
 * const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
 */

/*const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { require: true, rejectUnauthorized: false },
  // Connection pool settings
  max: 15, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters (for parameterized queries)
 * @returns {Promise<object>} Query result
 */
/*
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<object>} Database client
 */
/*
const getClient = () => {
  return pool.connect();
};

module.exports = {
  query,
  getClient,
  pool,
};
*/
const { Pool } = require('pg');

const conn = (process.env.DATABASE_URL || '').trim();
if (!conn) {
  console.warn('[db] DATABASE_URL not set. Any code calling db.query will fail.');
}

const pool = conn ? new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } }) : null;

async function query(text, params) {
  if (!pool) throw new Error('DATABASE_URL missing for db.query');
  return pool.query(text, params);
}

module.exports = { query };  
