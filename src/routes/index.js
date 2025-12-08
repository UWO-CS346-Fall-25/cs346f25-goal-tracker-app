/**
 * Index Routes
 *
 * Handles marketing/landing pages plus lightweight diagnostics endpoints.
 * All heavy lifting (data fetching + view composition) stays inside
 * `indexController` so these declarations stay simple.
 */
const express = require('express');
const router = express.Router();

const indexController = require('../controllers/indexController');

// HOME PAGE
router.get('/', indexController.getHome);

// ABOUT PAGE
router.get('/about', indexController.getAbout);

// DASHBOARD (uses real Supabase data)
router.get('/dashboard', indexController.getDashboard);

// HEALTH CHECK
router.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

// SIMPLE JSON TEST
router.get('/hello', (req, res) => {
  const name = (req.query.name || 'there').trim();
  res.json({
    message: `Hello from the server @ ${new Date().toLocaleTimeString()}, ${name}!`,
  });
});

module.exports = router;
