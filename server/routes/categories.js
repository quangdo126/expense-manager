import express from 'express';
import Category from '../models/Category.js';
import { auth, requireFamily, adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/categories
 * Get all categories for the family
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const { type } = req.query;

        const query = { familyId: req.user.familyId };
        if (type && ['expense', 'income'].includes(type)) {
            query.type = type;
        }

        const categories = await Category.find(query).sort({ isDefault: 1, name: 1 });

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/categories
 * Create a new category (admin only)
 */
router.post('/', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const { name, type, icon, keywords, color } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Vui lòng nhập tên và loại danh mục' });
        }

        if (!['expense', 'income'].includes(type)) {
            return res.status(400).json({ error: 'Loại danh mục không hợp lệ' });
        }

        // Check if category name exists
        const existing = await Category.findOne({
            familyId: req.user.familyId,
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existing) {
            return res.status(400).json({ error: 'Danh mục đã tồn tại' });
        }

        const category = new Category({
            familyId: req.user.familyId,
            name,
            type,
            icon: icon || '📝',
            keywords: keywords || [],
            color: color || '#6366f1'
        });

        await category.save();

        res.status(201).json({
            message: 'Tạo danh mục thành công',
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/categories/:id
 * Update a category (admin only)
 * For system default categories: only icon, color, keywords can be changed
 */
router.put('/:id', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const { name, type, icon, keywords, color } = req.body;

        const category = await Category.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!category) {
            return res.status(404).json({ error: 'Không tìm thấy danh mục' });
        }

        // System default categories (from defaultCategories) cannot change name or type
        if (category.isSystemDefault) {
            // Only allow icon, color, keywords changes
            if (icon) category.icon = icon;
            if (keywords !== undefined) category.keywords = keywords;
            if (color) category.color = color;
        } else {
            // Check name uniqueness if changed
            if (name && name !== category.name) {
                const existing = await Category.findOne({
                    familyId: req.user.familyId,
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                    _id: { $ne: category._id }
                });

                if (existing) {
                    return res.status(400).json({ error: 'Tên danh mục đã tồn tại' });
                }

                category.name = name;
            }

            if (type && ['expense', 'income'].includes(type)) {
                category.type = type;
            }
            if (icon) category.icon = icon;
            if (keywords !== undefined) category.keywords = keywords;
            if (color) category.color = color;
        }

        await category.save();

        res.json({
            message: 'Cập nhật danh mục thành công',
            category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/categories/:id
 * Delete a category (admin only)
 * System default categories cannot be deleted
 */
router.delete('/:id', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            familyId: req.user.familyId
        });

        if (!category) {
            return res.status(404).json({ error: 'Không tìm thấy danh mục' });
        }

        if (category.isSystemDefault) {
            return res.status(400).json({ error: 'Không thể xóa danh mục hệ thống' });
        }

        await category.deleteOne();

        res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;

