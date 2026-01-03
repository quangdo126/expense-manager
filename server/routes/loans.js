import express from 'express';
import Loan from '../models/Loan.js';
import { auth, requireFamily } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/loans
 * Get all loans for family
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const { type, status } = req.query;
        const query = { familyId: req.user.familyId };

        if (type) query.type = type;
        if (status) query.status = status;

        const loans = await Loan.find(query)
            .populate('userId', 'displayName')
            .sort({ createdAt: -1 });

        res.json({ loans });
    } catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/loans
 * Create a new loan
 */
router.post('/', auth, requireFamily, async (req, res) => {
    try {
        const { type, personName, amount, interestRate, dueDate, note } = req.body;

        if (!type || !personName || !amount) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const loan = new Loan({
            familyId: req.user.familyId,
            userId: req.user._id,
            type,
            personName,
            amount,
            remainingAmount: amount,
            interestRate: interestRate || 0,
            dueDate: dueDate ? new Date(dueDate) : null,
            note
        });

        await loan.save();
        await loan.populate('userId', 'displayName');

        res.status(201).json({
            message: 'Tạo khoản vay thành công',
            loan
        });
    } catch (error) {
        console.error('Create loan error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/loans/:id/payment
 * Record a payment
 */
router.post('/:id/payment', auth, requireFamily, async (req, res) => {
    try {
        const { amount, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Số tiền không hợp lệ' });
        }

        const loan = await Loan.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!loan) {
            return res.status(404).json({ error: 'Không tìm thấy khoản vay' });
        }

        loan.payments.push({ amount, note, date: new Date() });
        loan.remainingAmount = Math.max(0, loan.remainingAmount - amount);
        await loan.save();

        res.json({
            message: 'Ghi nhận thanh toán thành công',
            loan
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/loans/:id
 * Update a loan
 */
router.put('/:id', auth, requireFamily, async (req, res) => {
    try {
        const { personName, interestRate, dueDate, note, status } = req.body;

        const loan = await Loan.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!loan) {
            return res.status(404).json({ error: 'Không tìm thấy khoản vay' });
        }

        if (personName) loan.personName = personName;
        if (interestRate !== undefined) loan.interestRate = interestRate;
        if (dueDate) loan.dueDate = new Date(dueDate);
        if (note !== undefined) loan.note = note;
        if (status) loan.status = status;

        await loan.save();

        res.json({
            message: 'Cập nhật thành công',
            loan
        });
    } catch (error) {
        console.error('Update loan error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/loans/:id
 */
router.delete('/:id', auth, requireFamily, async (req, res) => {
    try {
        const loan = await Loan.findOneAndDelete({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!loan) {
            return res.status(404).json({ error: 'Không tìm thấy khoản vay' });
        }

        res.json({ message: 'Đã xóa khoản vay' });
    } catch (error) {
        console.error('Delete loan error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
