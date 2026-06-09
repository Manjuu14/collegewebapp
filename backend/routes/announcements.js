const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all announcements (newest first)
// @route   GET /api/announcements
// @access  Public
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name');
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { title, content, type } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }
        const announcement = new Announcement({
            title,
            content,
            type: type || 'announcement',
            postedBy: req.user._id,
        });
        const created = await announcement.save();
        // Return populated so frontend gets postedBy.name
        await created.populate('postedBy', 'name');
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin/Coordinator
router.delete('/:id', protect, authorize('admin', 'coordinator'), async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found.' });
        }
        await announcement.deleteOne();
        res.json({ message: 'Announcement deleted successfully.', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
