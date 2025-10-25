/**
 * Express Application Configuration
 *
 * This file configures:
 * - Express middleware (Helmet, sessions, CSRF protection)
 * - View engine (EJS)
 * - Static file serving
 * - Routes
 * - Error handling
 */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');
const expressLayouts = require('express-ejs-layouts');


//routers
const indexRouter = require('./routes/index');
const goalsRouter = require('./routes/goals');
const usersRouter = require('./routes/users');

//routers
const indexRouter = require('./routes/index');
const goalsRouter = require('./routes/goals');
const usersRouter = require('./routes/users');

//routers
const indexRouter = require('./routes/index');
const goalsRouter = require('./routes/goals');
const usersRouter = require('./routes/users');

// Initialize Express app
const app = express();
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout');   

app.disable('x-powered-by');
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Security middleware - Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

// View engine setup - EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// CSRF protection
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// Make CSRF token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
  res.locals.user = req.session.user || null;
  next();
});

if (app.get('env') === 'development') {
  app.set('view cache', false);
  app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
}

app.use('/', indexRouter);
app.use('/goals', goalsRouter);
app.use('/users', usersRouter);

app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      title: 'Invalid CSRF token',
      message: 'Your form session has expired or the CSRF token was invalid. Please try again.',
      error: { status: 403 },
    });
  }
  return next(err);
});


// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: { status: 404 },
  });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Set locals, only providing error details in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // Render error page
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message,
    error: res.locals.error,
  });
});

module.exports = app;
