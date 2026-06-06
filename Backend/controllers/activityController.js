import ActivityLog from '../models/ActivityLog.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate('performedBy', 'firstName lastName email role avatar');

  const total = await ActivityLog.countDocuments();

  return res.json(new ApiResponse(200, { logs, total, page: parseInt(page, 10), limit: parsedLimit }, 'Activity logs fetched'));
});

export const getMyActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const logs = await ActivityLog.find({ performedBy: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate('performedBy', 'firstName lastName email role avatar');

  const total = await ActivityLog.countDocuments({ performedBy: req.user._id });

  return res.json(new ApiResponse(200, { logs, total, page: parseInt(page, 10), limit: parsedLimit }, 'My activity logs fetched'));
});
