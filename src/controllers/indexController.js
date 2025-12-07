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

// Shared renderer that injects common locals (user + CSRF token) into views
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
      // cards rendered on landing page hero section
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

/*
exports.getAbout = (req, res) => {
  res.render('about', { title: 'About', showHero: false });
};
*/
exports.getAbout = async (req, res, next) => {
  try {
    const photos = await getRandomPhotos(1, 'goals success motivation'); // reuse Unsplash helper
    const aboutPhoto = photos?.[0] || null;

    renderPage(
      res,
      'about',
      {
        title: 'About',
        showHero: false,
        aboutPhoto,
      },
      req
    );
  } catch (error) {
    next(error);
  }
};

const Goal = require('../models/goals');
const { getRandomPhotos } = require('./apiController');


const { supabase } = require('../models/supabaseClient');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return res.redirect('/users/login'); // guard dashboard for authenticated users

    const { count: totalGoals } = await supabase
      .from('newgoal')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId); // count goals owned by user

    const { count: activeMilestones } = await supabase
      .from('milestones')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_complete', false); // outstanding milestones only

    const now = new Date();
    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 7); // rolling 7-day window

    const { count: logsThisWeek } = await supabase
      .from('logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString()); // time-bound filter

    res.render('dashboard', {
      title: 'Dashboard',
      user: req.session?.user,
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      stats: {
        totalGoals: totalGoals || 0,
        activeMilestones: activeMilestones || 0,
        logsThisWeek: logsThisWeek || 0,
      },
      cardPhotos: [], // placeholder until Unsplash integrations are re-enabled
      chart: { labels: [], values: [] }, // chart data TODO
    });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Dashboard error', error: err });
  }
};
