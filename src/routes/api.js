/**
 * API Routes
 *
 * Exposes lightweight JSON endpoints that power client-side interactions.
 * Each handler delegates to `apiController`, which contains the HTTP logic
 * and integrations (e.g., Unsplash search helpers).
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const apiRoutes = require('./src/routes/api');

// Proxy Unsplash-style photo searches: GET /api/photos?query=sunrise
router.get('/photos', apiController.searchPhotos);

// Allow composition if this router is nested under a larger /api namespace
app.use('/api', apiRoutes);

module.exports = router;
