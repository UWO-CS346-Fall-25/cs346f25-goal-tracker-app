// Put the logged-in user (if any) on res.locals for templates
function attachUser(req, res, next) {
    res.locals.user = req.session?.user || null;
    next();
  }
  
  // Save the original URL so we can redirect there after login
  function saveReturnTo(req) {
    if (!req.session) return;
    // only save GET routes (avoid reposting forms)
    if (req.method === 'GET') {
      req.session.returnTo = req.originalUrl || req.url;
    }
  }
  
  // Require NOT logged in (guest-only pages like /login, /register)
  function requireGuest(req, res, next) {
    if (req.session?.user) {
      return res.redirect('/dashboard');
    }
    next();
  }
  
  // Require logged in (protect routes)
  function requireAuth(req, res, next) {
    if (!req.session?.user) {
      saveReturnTo(req);
      return res.redirect('/users/login');
    }
    next();
  }
  
  // Optional role-based guard (expects req.session.user.role)
  function requireRole(...roles) {
    return (req, res, next) => {
      if (!req.session?.user) {
        saveReturnTo(req);
        return res.redirect('/users/login');
      }
      const role = req.session.user.role;
      if (!role || !roles.includes(role)) {
        // You can render a 403 page instead if you prefer
        return res.status(403).render('error', {
          title: 'Forbidden',
          message: 'You do not have permission to access this resource.',
          error: {},
        });
      }
      next();
    };
  }
  
  module.exports = {
    attachUser,
    requireGuest,
    requireAuth,
    requireRole,
  };
  