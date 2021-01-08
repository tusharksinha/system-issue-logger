const asyncHandler = require('express-async-handler');
const Log = require('../models/logModel');
// const User = require('../models/userModel');

//@desc Add a log
//@route POST /api/logs
//@access Private
exports.addLog = asyncHandler(async (req, res, next) => {
  const { issue, system, assignedTo, priority } = req.body;
  if (!issue || !system) {
    res.status(400);
    throw new Error('Issue & System name is required');
  }

  const newLog = new Log({
    log,
    system,
    assignedTo,
    priority,
  });
  newLog.createdBy = req.user.id;
  await newLog.save();
  res.status(201).json(newLog);
});

//@desc Get logs
//@route GET /api/logs
//@access Private
exports.getLogs = asyncHandler(async (req, res, next) => {
  const logs = await Log.find()
    .populate('assignedTo', 'firstName lastName')
    .populate('createdBy', 'firstName lastName');
  res.status(200).json(logs);
});

//@desc Filter logs
//@route POST /api/logs/search
//@access Private
exports.filterLogs = asyncHandler(async (req, res, next) => {
  const { userId, priority, resolved } = req.body;
  let queryObj = {};
  if (userId) {
    queryObj = { ...queryObj, assignedTo: userId };
  }
  if (priority) {
    queryObj = { ...queryObj, priority };
  }
  if (resolved) {
    queryObj = { ...queryObj, resolved };
  }
  const logs = await Log.find(queryObj)
    .populate('assignedTo', 'firstName lastName')
    .populate('createdBy', 'firstName lastName');
  res.status(200).json(logs);
});

//@desc Get a log
//@route POST /api/logs/:logId
//@access Private
exports.getLog = asyncHandler(async (req, res, next) => {
  const { logId } = req.params;
  const log = await Log.findById({ _id: logId });
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }
  res.status(200).json(log);
});

//@desc Get a log
//@route PUT /api/logs/:id
//@access Private
exports.updateLog = asyncHandler(async (req, res, next) => {
  const { issue, system, assignedTo, priority } = req.body;
  if (!issue || !system) {
    res.status(400);
    throw new Error('Log & System name is required');
  }
  const { logId } = req.params;
  let log = await Log.findById({ _id: logId });
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }

  log = await Log.findByIdAndUpdate(
    { _id: logId },
    { log, system, assignedTo, priority },
    { new: true, runValidators: true }
  );
  res.status(200).json(log);
});

//@desc Get assigned logs for user
//route GET /api/logs/assigned
exports.getMyLogs = asyncHandler(async (req, res, next) => {
  const { userId } = req.user;
  const logs = await Log.find({ assignedTo: userId });
  res.send(200).json(logs);
});

//@desc Get an assigned logs for user
//route GET /api/logs/assigned/:logId
exports.getMyLog = asyncHandler(async (req, res, next) => {
  const { userId } = req.user;
  const logs = await Log.find({ _id: logId, assignedTo: userId });
  res.send(200).json(logs);
});

//@desc Resolve a log and update note
//route PUT /api/logs/assigned/:logId
exports.resolveMyLog = asyncHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { resolved, resolutionNote } = req.body;
  const log = await Log.findOneAndUpdate(
    { _id: logId, assignedTo: userId },
    { resolved, resolutionNote },
    { new: true, runValidators: true }
  );
  res.send(200).json(log);
});
