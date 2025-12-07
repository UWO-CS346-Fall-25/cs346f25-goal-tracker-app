const { body, validationResult } = require('express-validator');
const Goal = require('../models/goals');
const Milestone = require('../models/milestones');
const Log = require('../models/logs');

// Controller functions for goal CRUD plus milestones/logs helpers

// GET /goals - list all goals for current user
exports.list = async (req, res, next) => {
  try {
    console.log('SESSION USER:', req.session.user);

    const userEmail = req.session.user?.email;
    if (!userEmail) return res.redirect('/users/login'); // require login before listing goals

    const goals = await Goal.allByUser(req.session.user.id); // scoped query to logged-in user
    res.render('goals/index', { title: 'Goals', goals });
  } catch (e) {
    next(e);
  }
};

// GET /goals/:id - show a single goal plus milestones/logs
exports.show = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/users/login'); // protect route
    const goalId = req.params.id;
    const goal = await Goal.findById(req.params.id, req.session.user.id); // ensure goal belongs to user
    if (!goal)
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Goal not found',
        error: {},
      });

    const [milestones, logs] = await Promise.all([
      Milestone.forGoal(goalId, userId),
      Log.forGoal(goalId, userId),
    ]); // load related items in parallel

    res.render('goals/show', {
      title: goal.goalname || 'Goal',
      goal,
      milestones,
      logs,
    });
  } catch (e) {
    next(e);
  }
};

// GET /goals/new - render create form
exports.newForm = (req, res) =>
  res.render('goals/new', { title: 'New Goal', errors: [] });

// Shared validators for create & update flows
exports.validate = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title required'), // simple validation pipeline
  body('description').trim().escape(),
  body('targetDate').optional({ checkFalsy: true }).isISO8601().toDate(),
];

// POST /goals - persist a new goal
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).render('goals/new', {
      title: 'New Goal',
      errors: errors.array(),
      goal: {
        title: req.body.title,
        description: req.body.description,
        targetDate: req.body.targetDate,
      },
    });

  try {
    const { title, description, targetDate } = req.body;
    const userId = req.session.user.id; // associate goal with logged-in user

    const created = await Goal.create({
      title,
      description,
      due: targetDate || null,
      user_id: userId,
    });
    const { id } = created;
    return res.redirect(`/goals/${id}`);
  } catch (e) {
    next(e);
  }
};

// GET /goals/:id/edit - edit form scoped to owner
exports.editForm = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id, req.session.user.id);
    if (!goal)
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Goal not found',
        error: {},
      });
    res.render('goals/edit', { title: `Edit: ${goal.goalname}`, goal });
  } catch (e) {
    next(e);
  }
};

// POST /goals/:id/edit - update existing goal
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).render('goals/edit', {
      title: 'Edit Goal',
      errors: errors.array(),
      goal: { ...req.body, id: req.params.id },
    });

  try {
    await Goal.update(req.params.id, req.session.user.id, {
      title: req.body.title,
      description: req.body.description,
      due: req.body.targetDate || null,
    });
    res.redirect(`/goals/${req.params.id}`);
  } catch (e) {
    next(e);
  }
};

// POST /goals/:id/delete - remove goal and redirect to list
exports.destroy = async (req, res, next) => {
  try {
    await Goal.destroy(req.params.id, req.session.user.id); // delete only if owned by user
    res.redirect('/goals');
  } catch (e) {
    next(e);
  }
};

// POST /goals/:id/milestones - create milestone for goal
exports.postMilestone = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/users/login');

    const goalId = req.params.id;
    const { title, due_date } = req.body;

    if (!title || !title.trim()) {
      // simple validation: require a title
      return res.redirect(`/goals/${goalId}`);
    }

    await Milestone.create({
      goalId,
      userId,
      title: title.trim(),
      due: due_date || null,
    }); // rely on model to enforce user ownership
    res.redirect(`/goals/${goalId}`);
  } catch (err) {
    next(err);
  }
};

// POST /goals/:id/logs - add progress log entry
exports.postLog = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/users/login');

    const goalId = req.params.id;
    const { note, metric_name, metric_value } = req.body;

    if (!note || !note.trim()) {
      // require a note
      return res.redirect(`/goals/${goalId}`);
    }

    await Log.create({
      goalId,
      userId,
      note: note.trim(),
      metric_name,
      metric_value,
    });

    res.redirect(`/goals/${goalId}`);
  } catch (err) {
    next(err);
  }
};

// POST /goals/:id/milestones/:mid/toggle - flip completion state
exports.toggleMilestone = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/users/login');

    const goalId = req.params.id;
    const milestoneId = req.params.mid;

    await Milestone.toggleComplete(milestoneId, userId);
    res.redirect(`/goals/${goalId}#milestones`);
  } catch (err) {
    next(err);
  }
};

// POST /goals/:id/milestones/:mid/delete - remove milestone record
exports.deleteMilestone = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/users/login');

    const goalId = req.params.id;
    const milestoneId = req.params.mid;

    await Milestone.destroy(milestoneId, userId);
    res.redirect(`/goals/${goalId}#milestones`);
  } catch (err) {
    next(err);
  }
};

// GET /goals/:id/milestones - standalone page listing milestones
exports.milestonesPage = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const goalId = req.params.id;

    const goal = await Goal.findById(goalId, userId);
    if (!goal) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Goal not found',
        error: {},
      });
    }

    const milestones = await Milestone.forGoal(goalId, userId);

    res.render('goals/milestones_list', {
      title: 'Milestones',
      goal,
      milestones,
    });
  } catch (err) {
    next(err);
  }
};

// GET /goals/:id/logs - standalone page listing logs
exports.logsPage = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const goalId = req.params.id;

    const goal = await Goal.findById(goalId, userId);
    if (!goal) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Goal not found',
        error: {},
      });
    }

    const logs = await Log.forGoal(goalId, userId);

    res.render('goals/logs_list', {
      title: 'Logs',
      goal,
      logs,
    });
  } catch (err) {
    next(err);
  }
};
