/**
 * User Routes
 *
 * Define routes related to user operations here.
 * This could include:
 * - User registration
 * - User login/logout
 * - User profile
 * - User management (admin)
 *
 * Example usage:
 * const express = require('express');
 * const router = express.Router();
 * const userController = require('../controllers/userController');
 *
 * router.get('/register', userController.getRegister);
 * router.post('/register', userController.postRegister);
 * router.get('/login', userController.getLogin);
 * router.post('/login', userController.postLogin);
 * router.post('/logout', userController.postLogout);
 *
 * module.exports = router;
 */

const express = require('express');
const router = express.Router();

function requireGuest(req, res, next) {
    if (req.session?.user) return res.redirect('/dashboard');
    next();
}

function requireAuth(req, res, next) {
    if (!req.session?.user) {
        // remember where to go after login
        req.session.returnTo = req.originalUrl;
        return res.redirect('/users/login');
    }
    next();
}

router.get('/login', requireGuest, (req, res) => {
    res.render('users/login', {
        title: 'Login',
    });
});

router.post('/login', requireGuest, (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    // Minimal validation
    const errors = [];
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Valid email is required.');
    if (!password) errors.push('Password is required.');

    if (errors.length) {
        return res.status(400).render('users/login', {
            title: 'Login',
            errors,
            values: { email }
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
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const confirm = String(req.body.confirm || '');

    const errors = [];
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Valid email is required.');
    if (!password) errors.push('Password is required.');
    if (password !== confirm) errors.push('Passwords do not match.');

    if (errors.length) {
        return res.status(400).render('users/register', {
            title: 'Register',
            errors,
            values: { email }
        });
    }

    req.session.user = { id: 2, email };
    return res.redirect('/dashboard');
})

router.post('/logout', requireAuth, (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

router.get('/profile', requireAuth, (req, res) => {
    res.render('profile', {
        title: 'Your Profile',
        user: req.session.user
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

module.exports = router;
