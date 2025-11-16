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
// const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const  supabase  = require('../models/supabaseClient').supabase;
const User = require('../models/User');

/**
 * GET /users/register
 * Display registration form
 */
exports.getRegister = (req, res) => {
  res.render('users/register', {
    title: 'Register',
    csrfToken: req.csrfToken(),
    errors: [],
    values: {},
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
          title: 'Register',
          csrfToken: req.csrfToken(),
          errors: errors.array(),
          values: { email, display_name: username },
        });
      }
      // Supabase sign up (email confirm optional in Supabase settings)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username }, emailRedirectTo: 'http://localhost:3000/users/login' },
      });
      if (error) {
        return res.status(400).render('users/register', {
          title: 'Register',
          csrfToken: req.csrfToken(),
          errors: [{ msg: error.message }],
          values: { email, display_name: username },
        });
      }
      // If email confirmation is ON, data.user may be null until they click the link
      if (!data.user) {
        // Show a friendly notice and send to login
        return res.redirect('/users/login');
      }
      // Ensure a profile row exists in public.users (id matches auth.users.id)
      const existing = await User.findById(data.user.id);
      if (!existing) await User.createProfile({ id: data.user.id, email, username });

      // Create our session
      req.session.user = { id: data.user.id, email, display_name: username };
      return req.session.save(() => res.redirect(req.session.returnTo || '/dashboard'));
    } catch (error) {
      next(error);
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
    errors: [],
    values: {},
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
      // const { email, password } = req.body;
      const { email, password } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('users/login', {
          title: 'Login',
          csrfToken: req.csrfToken(),
          errors: errors.array(),
          values: { email },
        });
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = /confirm|verified/i.test(error.message)
          ? 'Email not confirmed. Please check your inbox.'
          : 'Invalid email or password';
        return res.status(401).render('users/login', {
          title: 'Login',
          csrfToken: req.csrfToken(),
          errors: [{ msg: message }],
          values: { email },
        });
      }
      // Load display name from profile (if any)
      const profile = await User.findById(data.user.id);
      const display_name =
        profile?.username || profile?.display_name || data.user.user_metadata?.username || '';

      req.session.user = { id: data.user.id, email: data.user.email, display_name };
      return req.session.save(() => res.redirect(req.session.returnTo || '/dashboard'));
    } catch (error) {
      next(error);
    }
  }
];


/**
 * POST /users/logout
 * Logout user
 */
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
};

// Add more controller methods as needed
