import express from 'express';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { auth, requireFamily } from '../middleware/auth.js';
import { parseMessage } from '../services/nlpParser.js';
import { notifyFamilyMembers, createTransactionNotification } from '../services/pushService.js';

const router = express.Router();

/**
 * POST /api/transactions
 * Create a new transaction from chat input
 */
router.post('/', auth, requireFamily, async (req, res) => {
    try {
        const { input, categoryId, type, amount, description, date } = req.body;

        let transactionData = {};

        // If raw input is provided, parse it
        if (input) {
            const categories = await Category.find({ familyId: req.user.familyId });
            const parsed = parseMessage(input, categories);

            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error });
            }

            // Find default category if no match
            let category = parsed.matchedCategory;
            if (!category) {
                category = categories.find(c => c.isDefault && c.type === parsed.suggestedType);
            }

            transactionData = {
                familyId: req.user.familyId,
                userId: req.user._id,
                categoryId: category._id,
                type: parsed.suggestedType,
                amount: parsed.amount,
                description: parsed.keywords.join(' '),
                rawInput: input,
                date: date ? new Date(date) : new Date()
            };
        } else {
            // Manual entry
            if (!categoryId || !type || !amount) {
                return res.status(400).json({ error: 'Thiếu thông tin giao dịch' });
            }

            transactionData = {
                familyId: req.user.familyId,
                userId: req.user._id,
                categoryId,
                type,
                amount,
                description: description || '',
                date: date ? new Date(date) : new Date()
            };
        }

        const transaction = new Transaction(transactionData);
        await transaction.save();

        // Populate for response
        await transaction.populate('categoryId');
        await transaction.populate('userId', 'displayName');

        // Send push notifications to other family members
        try {
            const familyMembers = await User.find({ familyId: req.user.familyId });
            const notification = createTransactionNotification(
                transaction,
                req.user,
                transaction.categoryId
            );
            await notifyFamilyMembers(familyMembers, req.user._id, notification);
        } catch (pushError) {
            console.error('Push notification error:', pushError);
            // Don't fail the request if push fails
        }

        res.status(201).json({
            message: 'Tạo giao dịch thành công',
            transaction
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * GET /api/transactions
 * Get transactions with filters
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            categoryId,
            userId,
            type,
            limit = 50,
            page = 1
        } = req.query;

        const query = { familyId: req.user.familyId };

        // Date filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Category filter
        if (categoryId) {
            query.categoryId = categoryId;
        }

        // User filter
        if (userId) {
            query.userId = userId;
        }

        // Type filter
        if (type && ['expense', 'income'].includes(type)) {
            query.type = type;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('categoryId')
                .populate('userId', 'displayName')
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * GET /api/transactions/:id
 * Get single transaction
 */
router.get('/:id', auth, requireFamily, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        })
            .populate('categoryId')
            .populate('userId', 'displayName');

        if (!transaction) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }

        res.json({ transaction });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
router.put('/:id', auth, requireFamily, async (req, res) => {
    try {
        const { categoryId, type, amount, description, date } = req.body;

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }

        // Only owner or admin can edit
        if (transaction.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền sửa giao dịch này' });
        }

        // Update fields
        if (categoryId) transaction.categoryId = categoryId;
        if (type) transaction.type = type;
        if (amount) transaction.amount = amount;
        if (description !== undefined) transaction.description = description;
        if (date) transaction.date = new Date(date);

        await transaction.save();
        await transaction.populate('categoryId');
        await transaction.populate('userId', 'displayName');

        res.json({
            message: 'Cập nhật giao dịch thành công',
            transaction
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', auth, requireFamily, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }

        // Only owner or admin can delete
        if (transaction.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền xóa giao dịch này' });
        }

        await transaction.deleteOne();

        res.json({ message: 'Xóa giao dịch thành công' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/transactions/parse
 * Parse chat input without creating transaction (preview)
 */
router.post('/parse', auth, requireFamily, async (req, res) => {
    try {
        const { input } = req.body;

        if (!input) {
            return res.status(400).json({ error: 'Vui lòng nhập nội dung' });
        }

        const categories = await Category.find({ familyId: req.user.familyId });
        const parsed = parseMessage(input, categories);

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        // Find default category if no match
        let category = parsed.matchedCategory;
        if (!category) {
            category = categories.find(c => c.isDefault && c.type === parsed.suggestedType);
        }

        res.json({
            amount: parsed.amount,
            type: parsed.suggestedType,
            category,
            keywords: parsed.keywords,
            allCategories: categories.filter(c => c.type === parsed.suggestedType)
        });
    } catch (error) {
        console.error('Parse error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
