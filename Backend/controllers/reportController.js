import RFQ from '../models/RFQ.model.js';
import Approval from '../models/Approval.model.js';
import PurchaseOrder from '../models/PurchaseOrder.model.js';
import Invoice from '../models/Invoice.model.js';
import Vendor from '../models/Vendor.model.js';
import redis from '../config/redis.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const cacheKey = `cache:dashboard:${userId}`;

  // Check cache
  if (redis && redis.status === 'ready') {
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(new ApiResponse(200, JSON.parse(cachedData), 'Dashboard stats fetched from cache'));
      }
    } catch (e) {
      console.error('Redis read error for dashboard stats:', e.message);
    }
  }

  // Calculate start of month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Run stats queries
  const activeRFQs = await RFQ.countDocuments({ status: 'published' });
  
  // Pending approvals query
  let pendingApprovals = 0;
  if (req.user.role === 'officer') {
    pendingApprovals = await Approval.countDocuments({ overallStatus: 'pending', initiatedBy: req.user._id });
  } else if (req.user.role === 'manager' || req.user.role === 'admin') {
    pendingApprovals = await Approval.countDocuments({ overallStatus: 'pending' });
  }

  const recentPOs = await PurchaseOrder.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('vendor', 'companyName category logo');

  const spendAggregation = await Invoice.aggregate([
    { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);
  const spendThisMonth = spendAggregation[0]?.total || 0;

  const responseData = {
    activeRFQs,
    pendingApprovals,
    recentPOs,
    spendThisMonth
  };

  // Set cache
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300);
    } catch (e) {
      console.error('Redis write error for dashboard stats:', e.message);
    }
  }

  return res.json(new ApiResponse(200, responseData, 'Dashboard stats fetched'));
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const date = new Date();
  const yyyymm = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const cacheKey = `cache:reports:${yyyymm}`;

  // Check cache
  if (redis && redis.status === 'ready') {
    try {
      const cachedAnalytics = await redis.get(cacheKey);
      if (cachedAnalytics) {
        return res.json(new ApiResponse(200, JSON.parse(cachedAnalytics), 'Analytics fetched from cache'));
      }
    } catch (e) {
      console.error('Redis read error for analytics:', e.message);
    }
  }

  // 1. Spend by category
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6); // Last 6 months

  const spendByCategory = await PurchaseOrder.aggregate([
    { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startDate } } },
    { $lookup: { from: 'vendors', localField: 'vendor', foreignField: '_id', as: 'vendorDetails' } },
    { $unwind: '$vendorDetails' },
    { $group: { _id: '$vendorDetails.category', totalSpend: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
    { $sort: { totalSpend: -1 } }
  ]);

  // 2. Monthly trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTrend = await Invoice.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
    { $group: { 
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$grandTotal' }, 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format monthly trend to represent continuous months
  const formattedMonthlyTrend = monthlyTrend.map(item => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      month: `${months[item._id.month - 1]} ${item._id.year}`,
      total: item.total,
      count: item.count
    };
  });

  // 3. Top vendors
  const topVendors = await PurchaseOrder.aggregate([
    { $group: { _id: '$vendor', totalSpend: { $sum: '$grandTotal' }, poCount: { $sum: 1 } } },
    { $sort: { totalSpend: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendorDetails' } },
    { $unwind: '$vendorDetails' }
  ]);

  const responseData = {
    spendByCategory,
    monthlyTrend: formattedMonthlyTrend,
    topVendors
  };

  // Cache reports for 15 minutes (900s)
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 900);
    } catch (e) {
      console.error('Redis write error for analytics:', e.message);
    }
  }

  return res.json(new ApiResponse(200, responseData, 'Analytics fetched successfully'));
});

export const exportProcurementData = asyncHandler(async (req, res) => {
  const pos = await PurchaseOrder.find()
    .populate('vendor', 'companyName gstNumber category')
    .populate('issuedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  // Generate CSV string
  let csv = 'PO Number,Issue Date,Vendor Name,Category,GST Number,Issued By,Subtotal,Grand Total,Status\n';
  
  for (const po of pos) {
    const poNumber = po.poNumber;
    const date = new Date(po.issuedAt).toLocaleDateString('en-IN');
    const vendorName = `"${po.vendor?.companyName?.replace(/"/g, '""') || ''}"`;
    const category = po.vendor?.category || '';
    const gstNumber = po.vendor?.gstNumber || '';
    const issuedBy = `${po.issuedBy?.firstName || ''} ${po.issuedBy?.lastName || ''}`;
    const subtotal = po.subtotal || 0;
    const grandTotal = po.grandTotal || 0;
    const status = po.status;

    csv += `${poNumber},${date},${vendorName},${category},${gstNumber},${issuedBy},${subtotal},${grandTotal},${status}\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="procurement_report.csv"');
  return res.status(200).send(csv);
});
