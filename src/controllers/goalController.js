const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');

exports.list = async (req, res, next) => {
  try {
    const goals = await Goal.allByUser(req.session.user.id);
    res.render('goals/index', { title: 'Goals', goals });
  } catch (e) {
    next(e);
  }
};

exports.show = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id, req.session.user.id);
    if (!goal)
      return res
        .status(404)
        .render('error', {
          title: 'Not Found',
          message: 'Goal not found',
          error: {},
        });
    res.render('goals/show', { title: goal.title, goal });
  } catch (e) {
    next(e);
  }
};

exports.newForm = (req, res) => res.render('goals/new', { title: 'New Goal' });

exports.validate = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title required'),
  body('description').trim().escape(),
  body('targetDate').optional({ checkFalsy: true }).isISO8601().toDate(),
];

exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(422)
      .render('goals/new', { title: 'New Goal', errors: errors.array() });

  try {
    const { title, description, targetDate } = req.body;
    const { id } = await Goal.create({
      userId: req.session.user.id,
      title,
      description,
      targetDate,
    });
    res.redirect(`/goals/${id}`);
  } catch (e) {
    next(e);
  }
};

exports.editForm = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id, req.session.user.id);
    if (!goal)
      return res
        .status(404)
        .render('error', {
          title: 'Not Found',
          message: 'Goal not found',
          error: {},
        });
    res.render('goals/edit', { title: `Edit: ${goal.title}`, goal });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(422)
      .render('goals/edit', {
        title: 'Edit Goal',
        errors: errors.array(),
        goal: { ...req.body, id: req.params.id },
      });

  try {
    await Goal.update(req.params.id, req.session.user.id, {
      title: req.body.title,
      description: req.body.description,
      targetDate: req.body.targetDate,
      progress: Number(req.body.progress ?? 0),
      archived: !!req.body.archived,
    });
    res.redirect(`/goals/${req.params.id}`);
  } catch (e) {
    next(e);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await Goal.destroy(req.params.id, req.session.user.id);
    res.redirect('/goals');
  } catch (e) {
    next(e);
  }
};

exports.postMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, due } = req.body; // names from your form inputs
    // TODO: save to DB. For now, pretend success:
    console.log('[milestone]', { goalId: id, title, due });
    res.redirect(`/goals/${id}`);
  } catch (err) {
    next(err);
  }
};

exports.postLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, metricName, metricValue } = req.body;
    // TODO: save to DB. For now, pretend success:
    console.log('[log]', { goalId: id, note, metricName, metricValue });
    res.redirect(`/goals/${id}`);
  } catch (err) {
    next(err);
  }
};
