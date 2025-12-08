/**
 * Database Seed Script
 *
 * This script runs all seed files in the db/seeds folder.
 * Seeds are used to populate the database with initial or test data.
 *
 * Usage: npm run seed
 */

require('dotenv').config(); // so DATABASE_URL is available
const fs = require('fs');
const path = require('path');
const db = require('../src/models/db');

async function runSeeds() {
  console.log('Starting database seeding...');

  try {
    // Get all seed files
    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort(); // deterministic order when multiple seed files exist

    if (files.length === 0) {
      console.log('No seed files found.');
      return;
    }

    // Run each seed
    for (const file of files) {
      console.log(`Running seed: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await db.query(sql); // run SQL file contents directly
      console.log(`✓ Seed ${file} completed successfully`);
    }

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.pool.end(); // release connections for Node process exit
  }
}

// Run seeds
runSeeds();
