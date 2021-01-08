const asyncHandler = require('express-async-handler');
const validator = require('validator');
const crypto = require('crypto');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

//@desc Login user
//@route POST /api/auth
//@access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // res.status(400);
    res.status(400);
    throw new Error('Email &password is required');
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please enter a valid email');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const passwordMatch = await user.checkPassword(password);
  if (!passwordMatch) {
    res.status(401);
    throw new Error('Invalid credentials!');
  }

  const token = generateToken(user._id);
  res.status(200).json(token);
});

//@desc Get user
//@route GET /api/auth
//@access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  console.log();
  const id = req.user.id;
  const user = await User.findById(id);
  res.status(200).json(user);
});

//@desc Logout user
//@route GET /api/auth/logout
//@access Private
exports.logOut = async (req, res, next) => {
  const token = null;
  res.status(200).json(token);
};

//@description  Forgot password
//@route  POST /api/v1/auth/forgotpassword
//@access   Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please enter a valid email!');
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  }
  //Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/resetPassword/${resetToken}`;

  const emailMessage = `Hi, \n\nYou are receiving this email because you (or someone else) has requested a reset of password.Please use the link below to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      emailMessage,
    });

    res.status(200).send(`Password reset link sent to ${email}`);
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error(`Email was not sent. Please try later`);
  }
});

//@description  Update password
//@route  PUT /api/v1/auth/updatepassword
//@access   Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { currentPassword, password } = req.body;
  if (!currentPassword || !password) {
    res.status(400);
    throw new Error('Password & Current password is required');
  }
  const user = await User.findById({ _id: id }).select('+password');
  if (!(await user.checkPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  user.password = password;
  await user.save();

  const token = generateToken(user._id);
  res.status(200).json(token);
});

//@description  Reset Password
//@route  PUT /api/auth/resetpassword/:resettoken
//@access   Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid token or token has expired');
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  const token = await generateToken(user._id);
  res.status(200).json(token);
});
