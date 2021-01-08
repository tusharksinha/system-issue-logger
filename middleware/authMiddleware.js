const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.header('x-auth-token');
  console.log(token);

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, No token');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

exports.isAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const adminUser = await User.findById({ _id: id });
  console.log(adminUser);
  if (!adminUser.isAdmin) {
    res.status(401);
    throw new Error('Un-authorized access');
  }
  next();
});
