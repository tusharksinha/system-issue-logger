const express = require('express');
const {
  addLog,
  getLogs,
  getLog,
  updateLog,
  filterLogs,
  getMyLog,
  getMyLogs,
  resolveMyLog,
} = require('../controllers/logController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/assigned').get(getMyLogs);
router.route('/assigned/:logId').get(getMyLog).put(resolveMyLog);

router.use(isAdmin);

router.route('/').post(addLog).get(getLogs);
router.route('/:logId').put(updateLog).get(getLog);
router.route('/search').post(filterLogs);

module.exports = router;
