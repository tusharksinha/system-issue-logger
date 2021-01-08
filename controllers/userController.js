const asyncHandler = require('express-async-handler');
const passwordGenerator = require('generate-password');
const validator = require('validator');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

//@desc Add User
//@route POST /api/users
//@access Private
exports.addUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, isAdmin } = req.body;
  if (!firstName || !lastName || !email) {
    // res.status(400);
    res.status(400);
    throw new Error('First name, Last name & Email is required');
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please enter a valid email');
  }

  let user = await User.findOne({ email });
  if (user) {
    res.status(400);
    throw new Error('User already exists');
  }
  tempPassword = passwordGenerator.generate({
    length: 8,
    numbers: true,
  });
  user = new User({
    firstName,
    lastName,
    email,
    isAdmin,
    password: tempPassword,
  });

  await user.save();
  const loginUrl = `${req.protocol}://${req.get('host')}/api/auth/`;
  const emailMessage = `Hi ${firstName}, \n\n Your login is ${email}.\n\n Your password is ${tempPassword} \n\n The login URL is ${loginUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your account was created in IT OPS Console',
      emailMessage,
    });

    res.status(200).send(`Account created & Email sent to  ${email}`);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error('Account created but email send failed');
  }
});

//@desc  Get  users
//@route GET /api/users/
//@access Private

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json(users);
});

//@desc  Get  user
//@route GET /api/users/:id
//@access Private

exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json(user);
});

//@desc  Update  user
//@route PUT /api/users/:id
//@access Private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, isAdmin } = req.body;
  const id = req.params.id;
  if (!firstName || !lastName) {
    res.status(400);
    throw new Error('First name, Last name, Email is required');
  }

  let user = await User.findById({ _id: id });
  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  }
  user = await User.findByIdAndUpdate(
    id,
    { firstName, lastName, isAdmin },
    { new: true, runValidators: true }
  );
  res.status(200).json(user);
});

//@desc  Delete  user
//@route DELETE /api/users/:id
//@access Private

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  }
  await User.findByIdAndRemove(id);
  res.status(200).send('User deleted');
});
