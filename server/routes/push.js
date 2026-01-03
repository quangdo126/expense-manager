import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/push/vapid-key
 * Get VAPID public key for client
 */
router.get('/vapid-key', (req, res) => {
    res.json({
        publicKey: process.env.VAPID_PUBLIC_KEY || ''
    });
});

/**
 * POST /api/push/subscribe
 * Save push subscription for user
 */
router.post('/subscribe', auth, async (req, res) => {
    try {
        const { subscription } = req.body;

        if (!subscription) {
            return res.status(400).json({ error: 'Thiếu thông tin subscription' });
        }

        await User.findByIdAndUpdate(req.user._id, {
            pushSubscription: subscription
        });

        res.json({ message: 'Đăng ký thông báo thành công' });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * DELETE /api/push/unsubscribe
 * Remove push subscription
 */
router.delete('/unsubscribe', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            pushSubscription: null
        });

        res.json({ message: 'Hủy đăng ký thông báo thành công' });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
