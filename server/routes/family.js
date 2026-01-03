import express from 'express';
import User from '../models/User.js';
import Family from '../models/Family.js';
import { auth, requireFamily, adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/family
 * Get family info and members
 */
router.get('/', auth, requireFamily, async (req, res) => {
    try {
        const [family, members] = await Promise.all([
            Family.findById(req.user.familyId),
            User.find({ familyId: req.user.familyId })
                .select('username displayName role createdAt')
                .sort({ role: 1, createdAt: 1 })
        ]);

        res.json({ family, members });
    } catch (error) {
        console.error('Get family error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/family
 * Update family name (admin only)
 */
router.put('/', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Vui lòng nhập tên gia đình' });
        }

        const family = await Family.findByIdAndUpdate(
            req.user.familyId,
            { name },
            { new: true }
        );

        res.json({
            message: 'Cập nhật tên gia đình thành công',
            family
        });
    } catch (error) {
        console.error('Update family error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * POST /api/family/regenerate-code
 * Regenerate invite code (admin only)
 */
router.post('/regenerate-code', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const family = await Family.findById(req.user.familyId);
        await family.regenerateInviteCode();

        res.json({
            message: 'Tạo mã mời mới thành công',
            inviteCode: family.inviteCode
        });
    } catch (error) {
        console.error('Regenerate code error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/family/members/:userId
 * Remove a member from family (admin only)
 */
router.delete('/members/:userId', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const { userId } = req.params;

        // Cannot remove self
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Không thể xóa chính mình' });
        }

        const member = await User.findOne({
            _id: userId,
            familyId: req.user.familyId
        });

        if (!member) {
            return res.status(404).json({ error: 'Không tìm thấy thành viên' });
        }

        // Cannot remove another admin
        if (member.role === 'admin') {
            return res.status(400).json({ error: 'Không thể xóa admin khác' });
        }

        // Remove family reference (keep user data)
        member.familyId = null;
        await member.save();

        res.json({ message: 'Xóa thành viên thành công' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * PUT /api/family/members/:userId/role
 * Change member role (admin only)
 */
router.put('/members/:userId/role', auth, requireFamily, adminOnly, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'member'].includes(role)) {
            return res.status(400).json({ error: 'Vai trò không hợp lệ' });
        }

        const member = await User.findOne({
            _id: userId,
            familyId: req.user.familyId
        });

        if (!member) {
            return res.status(404).json({ error: 'Không tìm thấy thành viên' });
        }

        member.role = role;
        await member.save();

        res.json({
            message: 'Cập nhật vai trò thành công',
            member: member.toJSON()
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
