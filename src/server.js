/**
 * Server Entry Point
 *
 * This file is responsible for:
 * - Loading environment variables
 * - Starting the Express application
 * - Handling server startup errors
 */

require('dotenv').config(); // Pull in .env before anything else needs secrets
const app = require('./app'); // Express app with routes/middleware wired up

// Server configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, you might want to exit the process
  // process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, you might want to exit the process
  // process.exit(1);
});
