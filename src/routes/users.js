/**
 * User Routes
 *
 * Handles everything around authentication (register/login/logout) plus the
 * personalized profile + dashboard experiences. Route handlers lean on
 * `userController` for the heavy logic, keeping this file declarative.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { supabase } = require('../models/supabaseClient');

// Visitors should not see auth forms once signed in
function requireGuest(req, res, next) {
  if (req.session?.user) return res.redirect('/dashboard');
  next();
}

// Ensure downstream handlers have a logged-in user and remember return path
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    // remember where to go after login
    req.session.returnTo = req.originalUrl;
    return res.redirect('/users/login');
  }
  next();
}

// Register
router.get('/register', requireGuest, userController.getRegister);
router.post('/register', requireGuest, userController.postRegister);

// Login
router.get('/login', requireGuest, userController.getLogin);
router.post('/login', requireGuest, userController.postLogin);

// Logout
router.post('/logout', requireAuth, userController.postLogout);

/*
// Profile (example protected page)
router.get('/profile', requireAuth, (req, res) => {
  res.render('views/profile', { // ensure this path matches your views
    title: 'Your Profile',
    user: req.session.user
  });
});
*/
router.get('/profile', userController.getProfile);

// Dashboard (protected)
/*
router.get('/dashboard', requireAuth, (req, res) => {
  const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
  res.render('users/dashboard', {
    title: 'Dashboard',
    user: req.session.user,
    csrfToken
  });
});*/

// Authenticated dashboard with quick stats fetched directly via Supabase
router.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const csrfToken =
      typeof req.csrfToken === 'function' ? req.csrfToken() : '';

    const userId = req.session.user.id;

    // Count current goals for hero metric
    const { count: totalGoals, error: goalsError } = await supabase
      .from('newgoal')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    // Only include milestones still open
    const { count: activeMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_complete', false);

    if (milestonesError) throw milestonesError;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // Recent progress (logs created in last 7 days)
    const { count: logsThisWeek, error: logsError } = await supabase
      .from('logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString());

    if (logsError) throw logsError;

    res.render('users/dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      csrfToken,
      stats: {
        totalGoals: totalGoals ?? 0,
        activeMilestones: activeMilestones ?? 0,
        logsThisWeek: logsThisWeek ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

/*
router.get('/login', requireGuest, (req, res) => {
  res.render('users/login', {
    title: 'Login',
  });
});

router.post('/login', requireGuest, (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body.password || '');

  // Minimal validation
  const errors = [];
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    errors.push('Valid email is required.');
  if (!password) errors.push('Password is required.');

  if (errors.length) {
    return res.status(400).render('users/login', {
      title: 'Login',
      errors,
      values: { email },
    });
  }
  // TODO: replace with real user from DB
  req.session.user = { id: 1, email };

  const nextUrl = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  return res.redirect(nextUrl);
});

// Register form
router.get('/register', requireGuest, (req, res) => {
  const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
  res.render('users/register', { title: 'Register', csrfToken });
});

router.post('/register', requireGuest, (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body.password || '');
  const confirm = String(req.body.confirm || '');

  const errors = [];
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    errors.push('Valid email is required.');
  if (!password) errors.push('Password is required.');
  if (password !== confirm) errors.push('Passwords do not match.');

  if (errors.length) {
    return res.status(400).render('users/register', {
      title: 'Register',
      errors,
      values: { email },
    });
  }

  req.session.user = { id: 2, email };
  return res.redirect('/dashboard');
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

router.get('/profile', requireAuth, (req, res) => {
  res.render('profile', {
    title: 'Your Profile',
    user: req.session.user,
  });
});

router.get('/dashboard', requireAuth, (req, res) => {
  const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
  res.render('dashboard', {
    title: 'Dashboard',
    user: req.session.user,
    csrfToken,
  });
});
*/
module.exports = router;
