/**
 * Index Controller
 *
 * Controllers handle the business logic for routes.
 * They process requests, interact with models, and send responses.
 *
 * Best practices:
 * - Keep controllers focused on request/response handling
 * - Move complex business logic to separate service files
 * - Use models to interact with the database
 * - Handle errors appropriately
 */

// Import models if needed
// const SomeModel = require('../models/SomeModel');

/**
 * GET /
 * Display the home page
 */

function renderPage(res, view, locals = {}, req) {
  const baseLocals = {
    user: req?.session?.user || null,
  };

  // csurf attaches req.csrfToken() only after csrf middleware; guard just in case
  if (req && typeof req.csrfToken === 'function') {
    baseLocals.csrfToken = req.csrfToken();
  }

  // Helpful during dev so template/CSS tweaks always show
  if (res.app.get('env') === 'development') {
    res.set('Cache-Control', 'no-store');
  }

  res.render(view, { ...baseLocals, ...locals });
}

exports.getHome = async (req, res, next) => {
  try {
    const features = [
      {
        icon: '👤',
        title: 'Accounts & Profiles',
        copy: 'Sign up, log in, manage your profile.',
      },
      {
        icon: '🎯',
        title: 'Goals (CRUD)',
        copy: 'Create, update, archive goals like “Run 5k” or “Save $500”.',
      },
      {
        icon: '🚩',
        title: 'Milestones',
        copy: 'Break big goals into steps with due dates and completion toggles.',
      },
      {
        icon: '📒',
        title: 'Progress Logs',
        copy: 'Add dated notes and optional numeric values.',
      },
      {
        icon: '📈',
        title: 'Visualizations',
        copy: 'Charts to see completion over time.',
      },
    ];
    renderPage(res, 'index', { title: 'Home', features }, req);
  } catch (error) {
    next(error);
  }
};

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About', showHero: false });
};

const Goal = require('../models/goals');
const { getRandomPhotos } = require('./apiController');

exports.getDashboard = async (req, res, next) => {
  
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/users/login');

    const stats = { totalGoals: 3, activeMilestones: 7, logsThisWeek: 2 };
    //const totalGoals = await Goal.countByUser(userId);
    //const activeMilestones = 0;
    //const logsThisWeek = 0;

    const photos = await getRandomPhotos(3, 'goals success motivation');

    const chart = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [10, 20, 35, 50, 65, 70, 80],
    };

    renderPage(
      res,
      'dashboard',
      {
        title: 'Dashboard',
       // stats: { totalGoals, activeMilestones, logsThisWeek },
        stats,
        cardPhotos: photos,
        chart,
      },
      req
    );
  } catch (error) {
    next(error);
  }
};
