import express from 'express';
import Investment from '../models/Investment.js';
import { auth, requireFamily } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/investments
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const { status, type } = req.query;
        const query = { familyId: req.user.familyId };

        if (status) query.status = status;
        if (type) query.type = type;

        const investments = await Investment.find(query)
            .populate('userId', 'displayName')
            .sort({ createdAt: -1 });

        // Calculate totals
        const totals = investments.reduce((acc, inv) => {
            if (inv.status === 'active') {
                acc.totalInvested += inv.investedAmount;
                acc.totalValue += inv.currentValue;
            }
            return acc;
        }, { totalInvested: 0, totalValue: 0 });

        totals.totalProfit = totals.totalValue - totals.totalInvested;
        totals.profitPercent = totals.totalInvested > 0
            ? ((totals.totalProfit / totals.totalInvested) * 100).toFixed(2)
            : 0;

        res.json({ investments, totals });
    } catch (error) {
        console.error('Get investments error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/investments
 */
router.post('/', auth, requireFamily, async (req, res) => {
    try {
        const { name, type, investedAmount, currentValue, startDate, note } = req.body;

        if (!name || !investedAmount) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const investment = new Investment({
            familyId: req.user.familyId,
            userId: req.user._id,
            name,
            type: type || 'other',
            investedAmount,
            currentValue: currentValue || investedAmount,
            startDate: startDate ? new Date(startDate) : new Date(),
            note,
            history: [{ value: currentValue || investedAmount, date: new Date() }]
        });

        await investment.save();
        await investment.populate('userId', 'displayName');

        res.status(201).json({
            message: 'Tạo khoản đầu tư thành công',
            investment
        });
    } catch (error) {
        console.error('Create investment error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/investments/:id
 */
router.put('/:id', auth, requireFamily, async (req, res) => {
    try {
        const { name, currentValue, note, status } = req.body;

        const investment = await Investment.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!investment) {
            return res.status(404).json({ error: 'Không tìm thấy khoản đầu tư' });
        }

        if (name) investment.name = name;
        if (note !== undefined) investment.note = note;
        if (status) investment.status = status;

        // If currentValue changed, add to history
        if (currentValue && currentValue !== investment.currentValue) {
            investment.currentValue = currentValue;
            investment.history.push({ value: currentValue, date: new Date() });
        }

        await investment.save();

        res.json({
            message: 'Cập nhật thành công',
            investment
        });
    } catch (error) {
        console.error('Update investment error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/investments/:id
 */
router.delete('/:id', auth, requireFamily, async (req, res) => {
    try {
        await Investment.findOneAndDelete({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        res.json({ message: 'Đã xóa khoản đầu tư' });
    } catch (error) {
        console.error('Delete investment error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
