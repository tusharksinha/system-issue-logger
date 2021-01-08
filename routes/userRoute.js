const express = require('express');
const {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, isAdmin);
router.route('/').post(addUser).get(getUsers);
router.route('/:id').get(getUser).delete(deleteUser).put(updateUser);

module.exports = router;
