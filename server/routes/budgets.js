import express from 'express';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { auth, requireFamily, adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/budgets
 * Get all budgets with spending info
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const budgets = await Budget.find({
            familyId: req.user.familyId,
            isActive: true
        }).populate('categoryId');

        // Calculate spending for each budget
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
            const startDate = budget.period === 'monthly' ? startOfMonth : startOfWeek;

            const spending = await Transaction.aggregate([
                {
                    $match: {
                        familyId: req.user.familyId,
                        categoryId: budget.categoryId._id,
                        type: 'expense',
                        date: { $gte: startDate }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const spent = spending[0]?.total || 0;
            const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

            return {
                ...budget.toObject(),
                spent,
                percent: Math.round(percent),
                isOverBudget: percent >= 100,
                isNearLimit: percent >= budget.alertThreshold && percent < 100
            };
        }));

        res.json({ budgets: budgetsWithSpending });
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/budgets
 * Create or update a budget
 */
router.post('/', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const { categoryId, amount, period, alertThreshold } = req.body;

        if (!categoryId || !amount) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Upsert - create or update
        const budget = await Budget.findOneAndUpdate(
            { familyId: req.user.familyId, categoryId },
            {
                familyId: req.user.familyId,
                categoryId,
                amount,
                period: period || 'monthly',
                alertThreshold: alertThreshold || 80,
                isActive: true
            },
            { upsert: true, new: true }
        ).populate('categoryId');

        res.status(201).json({
            message: 'Đã lưu ngân sách',
            budget
        });
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/budgets/:id
 */
router.delete('/:id', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        await Budget.findOneAndDelete({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        res.json({ message: 'Đã xóa ngân sách' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
