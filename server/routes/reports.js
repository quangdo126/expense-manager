import express from 'express';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { auth, requireFamily } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/reports/summary
 * Get summary statistics
 */
router.get('/summary', auth, requireFamily, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to current month
        const now = new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endDate
            ? new Date(endDate)
            : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const matchStage = {
            familyId: req.user.familyId,
            date: { $gte: start, $lte: end }
        };

        // Aggregate totals
        const [totals, byCategory, byUser, recentTransactions] = await Promise.all([
            // Total income and expense
            Transaction.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$type',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ]),

            // By category
            Transaction.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: { categoryId: '$categoryId', type: '$type' },
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id.categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $project: {
                        categoryId: '$_id.categoryId',
                        type: '$_id.type',
                        categoryName: '$category.name',
                        categoryIcon: '$category.icon',
                        categoryColor: '$category.color',
                        total: 1,
                        count: 1
                    }
                },
                { $sort: { total: -1 } }
            ]),

            // By user
            Transaction.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: { userId: '$userId', type: '$type' },
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id.userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        userId: '$_id.userId',
                        type: '$_id.type',
                        displayName: '$user.displayName',
                        total: 1,
                        count: 1
                    }
                },
                { $sort: { total: -1 } }
            ]),

            // Recent transactions
            Transaction.find(matchStage)
                .populate('categoryId')
                .populate('userId', 'displayName')
                .sort({ date: -1 })
                .limit(10)
        ]);

        // Format totals
        const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
        const totalExpense = totals.find(t => t._id === 'expense')?.total || 0;
        const incomeCount = totals.find(t => t._id === 'income')?.count || 0;
        const expenseCount = totals.find(t => t._id === 'expense')?.count || 0;

        res.json({
            period: { start, end },
            totals: {
                income: totalIncome,
                expense: totalExpense,
                balance: totalIncome - totalExpense,
                incomeCount,
                expenseCount
            },
            byCategory,
            byUser,
            recentTransactions
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * GET /api/reports/daily
 * Get daily breakdown for charts
 */
router.get('/daily', auth, requireFamily, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to last 30 days
        const now = new Date();
        const end = endDate ? new Date(endDate) : now;
        const start = startDate
            ? new Date(startDate)
            : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const dailyData = await Transaction.aggregate([
            {
                $match: {
                    familyId: req.user.familyId,
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        type: '$type'
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    data: {
                        $push: {
                            type: '$_id.type',
                            total: '$total',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for chart
        const chartData = dailyData.map(day => {
            const income = day.data.find(d => d.type === 'income')?.total || 0;
            const expense = day.data.find(d => d.type === 'expense')?.total || 0;

            return {
                date: day._id,
                income,
                expense,
                balance: income - expense
            };
        });

        res.json({
            period: { start, end },
            dailyData: chartData
        });
    } catch (error) {
        console.error('Get daily error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * GET /api/reports/monthly
 * Get monthly breakdown
 */
router.get('/monthly', auth, requireFamily, async (req, res) => {
    try {
        const { year } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    familyId: req.user.familyId,
                    date: {
                        $gte: new Date(selectedYear, 0, 1),
                        $lte: new Date(selectedYear, 11, 31, 23, 59, 59)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.month',
                    data: {
                        $push: {
                            type: '$_id.type',
                            total: '$total',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for chart (fill missing months with 0)
        const chartData = [];
        for (let month = 1; month <= 12; month++) {
            const monthData = monthlyData.find(m => m._id === month);
            const income = monthData?.data.find(d => d.type === 'income')?.total || 0;
            const expense = monthData?.data.find(d => d.type === 'expense')?.total || 0;

            chartData.push({
                month,
                income,
                expense,
                balance: income - expense
            });
        }

        res.json({
            year: selectedYear,
            monthlyData: chartData
        });
    } catch (error) {
        console.error('Get monthly error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
