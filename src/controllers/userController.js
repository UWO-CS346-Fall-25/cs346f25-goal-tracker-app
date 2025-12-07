/**
 * User Controller
 */

const { body, validationResult } = require('express-validator');
const { supabase } = require('../models/supabaseClient');
const User = require('../models/User');

/**
 * GET /users/register
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) {
        return res.status(400).render('users/register', {
          title: 'Register',
          csrfToken: req.csrfToken(),
          errors: [{ msg: error.message }],
          values: { email, display_name: username },
        });
      }

      const userId = data.user.id;

      await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          display_name: username,
        })
        .then(() => console.log("Profile row created"))
        .catch(err => console.error("Profile insert error:", err));

      if (!data.session) {
        return res.render('users/check_email', {
          title: 'Confirm Your Email',
          message: 'Registration successful! Please check your inbox and confirm your email.',
        });
      }

      req.session.user = {
        id: userId,
        email,
        display_name: username,
      };

      return req.session.save(() => res.redirect('/dashboard'));
    } catch (err) {
      next(err);
    }
  },
];


/**
 * GET /users/login
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
*/
exports.postLogin = [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),

  async (req, res, next) => {
    try {
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
        return res.status(401).render('users/login', {
          title: 'Login',
          csrfToken: req.csrfToken(),
          errors: [{ msg: "Invalid email or password" }],
          values: { email },
        });
      }

      const userId = data.user.id;

      let profile = await User.findById(userId);
      let display_name =
        profile?.display_name ||
        data.user.user_metadata?.username ||
        email.split("@")[0];

      if (!profile) {
        console.log("Profile missing — creating now.");

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: data.user.email,
            display_name,
          });

        if (insertError) {
          console.error("Failed to auto-create profile:", insertError);
          throw insertError;
        }

        profile = await User.findById(userId);
      }

      req.session.user = {
        id: userId,
        email: data.user.email,
        display_name,
      };

      return req.session.save(() =>
        res.redirect(req.session.returnTo || '/dashboard')
      );

    } catch (error) {
      next(error);
    }
  },
];

/**
 * POST /users/logout
 */
exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/users/login');
  });
};

exports.getProfile = (req, res) => {
  if (!req.session.user) return res.redirect('/users/login');
  res.render('profile', { title: 'Profile' });
};
