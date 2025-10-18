const express = require('express');
const router = express.Router();

// list all goals
router.get('/', (req, res) => {
  res.render('goals/index', {
    title: 'Goals',
    goals: [], // stub data for now
  });
});

// new goal form
router.get('/new', (req, res) => {
  res.render('goals/new', { title: 'New Goal' });
});

// show one goal
router.get('/:id', (req, res) => {
  res.render('goals/show', {
    title: 'Goal Details',
    goal: { id: req.params.id, title: 'Example Goal' },
    milestones: [],
    logs: []
  });
});

// edit form
router.get('/:id/edit', (req, res) => {
  res.render('goals/edit', {
    title: 'Edit Goal',
    goal: { id: req.params.id, title: 'Example Goal' }
  });
});

module.exports = router;
