const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Verifies the Bearer JWT and attaches req.user.
 * Uses `return` on every path to guarantee only one response is sent.
 */
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        return next();
    } catch (error) {
        console.error('JWT verify error:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

/**
 * authorize(...roles) — Checks req.user.role against allowed roles.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user?.role}' is not permitted.`,
            });
        }
        return next();
    };
};

module.exports = { protect, authorize };
