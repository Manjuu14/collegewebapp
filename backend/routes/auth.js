const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

// ── Generate JWT ──────────────────────────────────────────────────────────────
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', { expiresIn: '30d' });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        const user = await User.create({ name, email, password, role: role || 'student' });

        return res.status(201).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Register error:', error.message);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Guard: ensure body fields exist
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            regNumber: user.regNumber,
            semester: user.semester,
            section: user.section,
            course: user.course,
            image: user.image,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        // SECURITY: Never allow role to be changed via profile update
        // user.role is intentionally excluded here

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Student-specific fields (safe to update, role is excluded above)
        if (req.body.regNumber !== undefined) user.regNumber = req.body.regNumber;
        if (req.body.semester !== undefined) user.semester = req.body.semester;
        if (req.body.section !== undefined) user.section = req.body.section;
        if (req.body.course !== undefined) user.course = req.body.course;
        if (req.body.image !== undefined) user.image = req.body.image;

        const updated = await user.save();

        return res.status(200).json({
            success: true,
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            regNumber: updated.regNumber,
            semester: updated.semester,
            section: updated.section,
            course: updated.course,
            image: updated.image,
            token: generateToken(updated._id),
        });
    } catch (error) {
        console.error('Profile update error:', error.message);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Called on every page load to validate token & restore session
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({
            success: true,
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            regNumber: user.regNumber,
            semester: user.semester,
            section: user.section,
            course: user.course,
            image: user.image,
        });
    } catch (error) {
        console.error('Auth/me error:', error.message);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
