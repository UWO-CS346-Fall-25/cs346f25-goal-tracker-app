/**
 * Goal Routes
 *
 * Coordinates HTTP endpoints for CRUD-ing goals, milestones, and logs.
 * Every handler delegates to `goalController`, so this file remains declarative.
 */
const express = require('express');
const router = express.Router();
const goals = require('../controllers/goalController');
const { requireAuth } = require('../middleware/auth');

// Ensure all nested routes require an authenticated session
router.use(requireAuth);

// Goal index + create
router.get('/', goals.list);
router.get('/new', goals.newForm);
router.post('/', goals.validate, goals.create);

// Goal detail + edit
router.get('/:id', goals.show);
router.get('/:id/edit', goals.editForm);
router.post('/:id', goals.validate, goals.update);
router.post('/:id/edit', goals.validate, goals.update); // legacy form action fallback

router.post('/:id/delete', goals.destroy);

// Milestone management scoped to a goal
router.post('/:id/milestones', goals.postMilestone);
router.post('/:id/milestones/:mid/toggle', goals.toggleMilestone);
router.post('/:id/milestones/:mid/delete', goals.deleteMilestone);
router.get('/:id/milestones', goals.milestonesPage);

// Progress logs per goal
router.get('/:id/logs', goals.logsPage);
router.post('/:id/logs', goals.postLog);

module.exports = router;
