const express = require('express');
const {
  login,
  logOut,
  getMe,
  forgotPassword,
  updatePassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resettoken', resetPassword);

router.use(protect);
router.get('/me', getMe);
router.get('/logout', logOut);
router.put('/updatePassword', updatePassword);
module.exports = router;
