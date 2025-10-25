/**
 * Index Routes
 *
 * Define routes for the main pages of your application here.
 * Routes connect HTTP requests to controller functions.
 *
 * Example usage:
 * const express = require('express');
 * const router = express.Router();
 * const indexController = require('../controllers/indexController');
 *
 * router.get('/', indexController.getHome);
 * router.get('/about', indexController.getAbout);
 *
 * module.exports = router;
 */

const express = require('express');
const router = express.Router();

// Import controllers
// const indexController = require('../controllers/indexController');

// Define routes
// router.get('/', indexController.getHome);

// dummy comment
router.get('/', (req, res) => {
  res.render('index', { title: 'Goal Tracker' });
});
//interactivity
// GET /hello  -> used by fetch()
router.get('/hello', (req, res) => {
  const name = (req.query.name || 'there').trim();
  res.json({ message: `Hello from index route, ${name}!` });
});

router.get('/about', (req, res) => {
  // make a simple about.ejs or change this route
  res.render('about', { title: 'About' });
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: { username: 'Zafeer' },
    stats: { totalGoals: 3, activeMilestones: 7, logsThisWeek: 2 },
    chart: { labels: ['Mon','Tue','Wed','Thu','Fri'], values: [10,20,40,60,70] }
  });
});

module.exports = router;
