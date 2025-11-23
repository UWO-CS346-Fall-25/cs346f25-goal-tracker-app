const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const apiRoutes = require('./src/routes/api');

router.get('/photos', apiController.searchPhotos);
app.use('/api', apiRoutes);

module.exports = router;