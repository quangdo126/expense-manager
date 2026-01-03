import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Family from '../models/Family.js';
import Category, { defaultCategories } from '../models/Category.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user and create a family (admin)
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, displayName, familyName } = req.body;

        // Validation
        if (!username || !password || !displayName || !familyName) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: 'Tên đăng nhập phải từ 3-20 ký tự' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải ít nhất 6 ký tự' });
        }

        // Check if username exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }

        // Create user first (without family)
        const user = new User({
            username: username.toLowerCase(),
            password,
            displayName,
            role: 'admin'
        });
        await user.save();

        // Create family
        const family = new Family({
            name: familyName,
            createdBy: user._id
        });
        await family.save();

        // Update user with family ID
        user.familyId = family._id;
        await user.save();

        // Create default categories for the family (marked as system default)
        const categories = defaultCategories.map(cat => ({
            ...cat,
            familyId: family._id,
            isSystemDefault: true
        }));
        await Category.insertMany(categories);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            user: user.toJSON(),
            family,
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/auth/login
 * Login with username and password
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
        }

        // Find user
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Get family info
        let family = null;
        if (user.familyId) {
            family = await Family.findById(user.familyId);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            user: user.toJSON(),
            family,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/auth/join
 * Join an existing family using invite code
 */
router.post('/join', async (req, res) => {
    try {
        const { username, password, displayName, inviteCode } = req.body;

        // Validation
        if (!username || !password || !displayName || !inviteCode) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
        }

        // Find family by invite code
        const family = await Family.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!family) {
            return res.status(400).json({ error: 'Mã mời không hợp lệ' });
        }

        // Check if username exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }

        // Count family members (max 5)
        const memberCount = await User.countDocuments({ familyId: family._id });
        if (memberCount >= 5) {
            return res.status(400).json({ error: 'Gia đình đã đạt số thành viên tối đa (5)' });
        }

        // Create user
        const user = new User({
            username: username.toLowerCase(),
            password,
            displayName,
            familyId: family._id,
            role: 'member'
        });
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Tham gia gia đình thành công',
            user: user.toJSON(),
            family,
            token
        });
    } catch (error) {
        console.error('Join error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', auth, async (req, res) => {
    try {
        let family = null;
        if (req.user.familyId) {
            family = await Family.findById(req.user.familyId);
        }

        res.json({
            user: req.user,
            family
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu mới phải ít nhất 6 ký tự' });
        }

        // Get user with password
        const user = await User.findById(req.user._id);

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/auth/avatar
 * Update user avatar (emoji or URL)
 */
router.put('/avatar', auth, async (req, res) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({ error: 'Vui lòng chọn avatar' });
        }

        const user = await User.findById(req.user._id);
        user.avatar = avatar;
        await user.save();

        res.json({
            message: 'Cập nhật avatar thành công',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;

