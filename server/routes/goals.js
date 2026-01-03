import express from 'express';
import SavingsGoal from '../models/SavingsGoal.js';
import { auth, requireFamily } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/goals
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const { status } = req.query;
        const query = { familyId: req.user.familyId };

        if (status) query.status = status;

        const goals = await SavingsGoal.find(query)
            .populate('contributions.userId', 'displayName')
            .sort({ createdAt: -1 });

        res.json({ goals });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/goals
 */
router.post('/', auth, requireFamily, async (req, res) => {
    try {
        const { name, targetAmount, deadline, icon, color } = req.body;

        if (!name || !targetAmount) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const goal = new SavingsGoal({
            familyId: req.user.familyId,
            name,
            targetAmount,
            deadline: deadline ? new Date(deadline) : null,
            icon: icon || '🎯',
            color: color || '#6366f1'
        });

        await goal.save();

        res.status(201).json({
            message: 'Tạo mục tiêu thành công',
            goal
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/goals/:id/contribute
 */
router.post('/:id/contribute', auth, requireFamily, async (req, res) => {
    try {
        const { amount, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Số tiền không hợp lệ' });
        }

        const goal = await SavingsGoal.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!goal) {
            return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
        }

        goal.contributions.push({
            userId: req.user._id,
            amount,
            note,
            date: new Date()
        });
        goal.currentAmount += amount;
        await goal.save();

        await goal.populate('contributions.userId', 'displayName');

        res.json({
            message: 'Đã thêm tiền tiết kiệm',
            goal
        });
    } catch (error) {
        console.error('Contribute error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/goals/:id
 */
router.put('/:id', auth, requireFamily, async (req, res) => {
    try {
        const { name, targetAmount, deadline, icon, color, status } = req.body;

        const goal = await SavingsGoal.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!goal) {
            return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
        }

        if (name) goal.name = name;
        if (targetAmount) goal.targetAmount = targetAmount;
        if (deadline) goal.deadline = new Date(deadline);
        if (icon) goal.icon = icon;
        if (color) goal.color = color;
        if (status) goal.status = status;

        await goal.save();

        res.json({
            message: 'Cập nhật thành công',
            goal
        });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/goals/:id
 */
router.delete('/:id', auth, requireFamily, async (req, res) => {
    try {
        await SavingsGoal.findOneAndDelete({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        res.json({ message: 'Đã xóa mục tiêu' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
