const express = require('express');
const router = express.Router();
const goals = require('../controllers/goalController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', goals.list);
router.get('/new', goals.newForm);
router.post('/', goals.validate, goals.create);

router.get('/:id', goals.show);

router.get('/:id/edit', goals.editForm);
router.post('/:id', goals.validate, goals.update);
router.post('/:id/edit', goals.validate, goals.update);

router.post('/:id/delete', goals.destroy);

router.post('/:id/milestones', goals.postMilestone);
router.post('/:id/milestones/:mid/toggle', goals.toggleMilestone);
router.post('/:id/milestones/:mid/delete', goals.deleteMilestone);
router.get('/:id/milestones', goals.milestonesPage);

router.get('/:id/logs', goals.logsPage);
router.post('/:id/logs', goals.postLog);

module.exports = router;