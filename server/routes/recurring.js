import express from 'express';
import RecurringTransaction from '../models/RecurringTransaction.js';
import Transaction from '../models/Transaction.js';
import { auth, requireFamily } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/recurring
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const recurring = await RecurringTransaction.find({
            familyId: req.user.familyId
        })
            .populate('categoryId')
            .populate('userId', 'displayName')
            .sort({ nextRun: 1 });

        res.json({ recurring });
    } catch (error) {
        console.error('Get recurring error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/recurring
 */
router.post('/', auth, requireFamily, async (req, res) => {
    try {
        const { categoryId, type, amount, description, frequency, dayOfMonth, dayOfWeek } = req.body;

        if (!categoryId || !type || !amount) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Calculate next run date
        const now = new Date();
        let nextRun = new Date();

        switch (frequency) {
            case 'daily':
                nextRun.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                const targetDay = dayOfWeek || 1;
                const daysUntil = (targetDay - now.getDay() + 7) % 7 || 7;
                nextRun.setDate(now.getDate() + daysUntil);
                break;
            case 'monthly':
                const targetDayOfMonth = dayOfMonth || 1;
                if (now.getDate() >= targetDayOfMonth) {
                    nextRun.setMonth(now.getMonth() + 1);
                }
                nextRun.setDate(Math.min(targetDayOfMonth, new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate()));
                break;
            case 'yearly':
                nextRun.setFullYear(now.getFullYear() + 1);
                break;
        }

        const recurring = new RecurringTransaction({
            familyId: req.user.familyId,
            userId: req.user._id,
            categoryId,
            type,
            amount,
            description,
            frequency: frequency || 'monthly',
            dayOfMonth: dayOfMonth || 1,
            dayOfWeek,
            nextRun
        });

        await recurring.save();
        await recurring.populate('categoryId');
        await recurring.populate('userId', 'displayName');

        res.status(201).json({
            message: 'Tạo giao dịch định kỳ thành công',
            recurring
        });
    } catch (error) {
        console.error('Create recurring error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/recurring/:id/run
 * Manually run a recurring transaction
 */
router.post('/:id/run', auth, requireFamily, async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!recurring) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch định kỳ' });
        }

        // Create transaction
        const transaction = new Transaction({
            familyId: req.user.familyId,
            userId: req.user._id,
            categoryId: recurring.categoryId,
            type: recurring.type,
            amount: recurring.amount,
            description: recurring.description,
            date: new Date()
        });
        await transaction.save();

        // Update next run
        const now = new Date();
        switch (recurring.frequency) {
            case 'daily':
                recurring.nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                recurring.nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                recurring.nextRun = new Date(now.setMonth(now.getMonth() + 1));
                break;
            case 'yearly':
                recurring.nextRun = new Date(now.setFullYear(now.getFullYear() + 1));
                break;
        }
        recurring.lastRun = new Date();
        await recurring.save();

        res.json({
            message: 'Đã tạo giao dịch',
            transaction
        });
    } catch (error) {
        console.error('Run recurring error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/recurring/:id
 */
router.put('/:id', auth, requireFamily, async (req, res) => {
    try {
        const { amount, description, isActive } = req.body;

        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!recurring) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch định kỳ' });
        }

        if (amount) recurring.amount = amount;
        if (description !== undefined) recurring.description = description;
        if (isActive !== undefined) recurring.isActive = isActive;

        await recurring.save();

        res.json({
            message: 'Cập nhật thành công',
            recurring
        });
    } catch (error) {
        console.error('Update recurring error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/recurring/:id
 */
router.delete('/:id', auth, requireFamily, async (req, res) => {
    try {
        await RecurringTransaction.findOneAndDelete({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        res.json({ message: 'Đã xóa giao dịch định kỳ' });
    } catch (error) {
        console.error('Delete recurring error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
