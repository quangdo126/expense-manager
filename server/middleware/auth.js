import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Không có token xác thực' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'Token không hợp lệ' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token đã hết hạn' });
        }
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
};

/**
 * Admin middleware - requires user to be family admin
 */
export const adminOnly = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Chỉ admin mới có quyền thực hiện' });
    }
    next();
};

/**
 * Family member middleware - requires user to have a family
 */
export const requireFamily = async (req, res, next) => {
    if (!req.user.familyId) {
        return res.status(400).json({ error: 'Bạn chưa tham gia gia đình nào' });
    }
    next();
};

export default { auth, adminOnly, requireFamily };
