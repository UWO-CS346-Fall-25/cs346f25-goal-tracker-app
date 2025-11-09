const express = require('express');
const router = express.Router();
const goals = require('../controllers/goalController');
/*
const goals = [];
let nextId = 1;

const sanitize = (s) => (typeof s === 'string' ? s.trim() : '');
const findById = (id) => goals.find((g) => String(g.id) === String(id));


// list all goals
router.get('/', (req, res) => {
  res.render('goals/index', {
    title: 'Goals',
    goals,
  });
});
*/
/*
// new goal form
router.get('/new', (req, res) => {
  res.render('goals/new', {
    title: 'New Goal',
    goal: { title: '', description: '', due: '' },
    errors: {},
  });
});*

router.post('/', (req, res) => {
  const title = sanitize(req.body.title);
  const description = sanitize(req.body.description);
  const due = sanitize(req.body.due);

  const errors = {};
  if (!title) errors.title = 'Title is required';
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    errors.due = 'Use YYYY-MM-DD format';
  }

  if (Object.keys(errors).length) {
    return res.status(422).render('goals/new', {
      title: 'New Goal',
      goal: { title, description, due },
      errors,
    });
  }
  const newGoal = {
    id: nextId++,
    title,
    description,
    due,
    milestones: [],
    logs: [],
  };
  goals.push(newGoal);

  res.redirect(`/goals/${newGoal.id}`);
});

// show one goal
router.get('/:id', (req, res) => {
  const goal = findById(req.params.id);
  if (!goal) {
    return res.status(404).render('error', {
      title: 'Not Found',
      message: 'Goal not found',
      error: { status: 404 },
    });
  }

  res.render('goals/show', {
    title: goal.title || 'Goal Details',
    goal,
    milestones: goal.milestones,
    logs: goal.logs,
  });
});

// edit form
router.get('/:id/edit', (req, res) => {
  const goal = findById(req.params.id);
  if (!goal) {
    return res.status(404).render('error', {
      title: 'Not Found',
      message: 'Goal not found',
      error: { status: 404 },
    });
  }

  res.render('goals/edit', {
    title: `Edit: ${goal.title || 'Goal'}`,
    goal,
    errors: {},
  });
});

router.post('/:id/edit', (req, res) => {
  const goal = findById(req.params.id);
  if (!goal) {
    return res.status(404).render('error', {
      title: 'Not Found',
      message: 'Goal not found',
      error: { status: 404 },
    });
  }

  const title = sanitize(req.body.title);
  const description = sanitize(req.body.description);
  const due = sanitize(req.body.due);

  const errors = {};
  if (!title) errors.title = 'Title is required';
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    errors.due = 'Use YYYY-MM-DD format';
  }

  if (Object.keys(errors).length) {
    return res.status(422).render('goals/edit', {
      title: `Edit: ${goal.title || 'Goal'}`,
      goal: { ...goal, title, description, due },
      errors,
    });
  }

  goal.title = title;
  goal.description = description;
  goal.due = due;

  res.redirect(`/goals/${goal.id}`);
});

router.post('/:id/delete', (req, res) => {
  const idx = goals.findIndex((g) => String(g.id) === String(req.params.id));
  if (idx === -1) {
    return res.status(404).render('error', {
      title: 'Not Found',
      message: 'Goal not found',
      error: { status: 404 },
    });
  }

  goals.splice(idx, 1);
  res.redirect('/goals');
});
*/
router.get('/', goals.list);

router.get('/new', goals.newForm);
router.post('/', goals.validate, goals.create);

router.get('/new', goals.newForm);
router.post('/', goals.validate, goals.create);

router.get('/:id', goals.show);

router.get('/:id/edit', goals.editForm);

router.post('/:id', goals.validate, goals.update);
router.post('/:id/edit', goals.validate, goals.update);

router.post('/:id/delete', goals.destroy);

router.post('/:id/milestones', goals.postMilestone);
router.post('/:id/logs', goals.postLog);


module.exports = router;
