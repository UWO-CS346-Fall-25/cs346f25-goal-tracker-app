/**
 * User Controller
 *
 * Handles user-related operations:
 * - Registration
 * - Login/Logout
 * - Profile management
 * - Authentication
 */

// Import models
//const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../models/db');
const User = require('../models/User');


/**
 * GET /users/register
 * Display registration form
 */
exports.getRegister = (req, res) => {
  res.render('users/register', {
    title: 'Register',
    csrfToken: req.csrfToken(),
  });
};

/**
 * POST /users/register
 * Process registration form
 */
exports.postRegister = [
  body('email').trim().isEmail().withMessage('Enter a valid email'),
  body('display_name').trim().notEmpty().withMessage('Display name required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const { email, display_name: username, password } = req.body;

      if (!errors.isEmpty()) {
        return res.status(400).render('users/register', {
          title: 'Register', csrfToken: req.csrfToken(), errors: errors.array(),
          values: { email, display_name: username }
        });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } } 
      });
      if (error) {
        return res.status(400).render('users/register', {
          title: 'Register', csrfToken: req.csrfToken(),
          errors: [{ msg: error.message }], values: { email, display_name: username }
        });
      }

      const authUser = data.user; 
      if (!authUser) {
        req.flash?.('info', 'Check your email to confirm your account.');
        return res.redirect('/users/login');
      }

      const existing = await User.findById(authUser.id);
      if (!existing) {
        await User.createProfile({ id: authUser.id, email, username });
      }

      req.session.user = { id: authUser.id, email, display_name: username };
      res.redirect('/dashboard');
    } catch (err) {
      next(err);
    }
  }
];

/**
 * GET /users/login
 * Display login form
 */
exports.getLogin = (req, res) => {
  res.render('users/login', {
    title: 'Login',
    csrfToken: req.csrfToken(),
  });
};

/**
 * POST /users/login
 * Process login form
 */
exports.postLogin = [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const { email, password } = req.body;

      if (!errors.isEmpty()) {
        return res.status(400).render('users/login', {
          title: 'Login', csrfToken: req.csrfToken(), errors: errors.array(), values: { email }
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return res.status(401).render('users/login', {
          title: 'Login', csrfToken: req.csrfToken(),
          errors: [{ msg: 'Invalid email or password' }], values: { email }
        });
      }

      const profile = await User.findById(data.user.id);
      const display_name = profile?.username || profile?.display_name || data.user.user_metadata?.username || '';

      req.session.user = { id: data.user.id, email: data.user.email, display_name };
   
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
}
];

/**
 * POST /users/logout
 * Logout user
 */
exports.postLogout = async (req, res) => {
  try {
    await supabase.auth.signOut().catch(() => {}); 
  } finally {
    req.session.destroy(() => res.redirect('/'));
  }
};

// Add more controller methods as needed
