const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/upload');

// @desc    Get all clubs (Approved only)
// @route   GET /api/clubs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const clubs = await Club.find({ status: 'approved' })
            .sort({ name: 1 })
            .populate('coordinator', 'name email regNumber semester section course')
            .populate('members', 'name email regNumber semester section course');
        return res.json(clubs);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get ALL clubs (Admin only)
// @route   GET /api/clubs/admin-all
// @access  Private/Admin
router.get('/admin-all', protect, authorize('admin'), async (req, res) => {
    try {
        const clubs = await Club.find()
            .sort({ createdAt: -1 })
            .populate('coordinator', 'name email regNumber semester section course')
            .populate('members', 'name email regNumber semester section course');
        return res.json(clubs);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get Coordinator's own clubs
// @route   GET /api/clubs/my-clubs
// @access  Private/Coordinator
router.get('/my-clubs', protect, authorize('coordinator'), async (req, res) => {
    try {
        const clubs = await Club.find({ coordinator: req.user._id })
            .sort({ createdAt: -1 })
            .populate('members', 'name email regNumber semester section course');
        return res.json(clubs);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


// @desc    Get members of a specific club (with full student details)
// @route   GET /api/clubs/:id/members
// @access  Private/Admin
router.get('/:id/members', protect, authorize('admin'), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
            .populate('members', 'name email regNumber semester section course');
        if (!club) return res.status(404).json({ message: 'Club not found' });
        return res.json({
            clubName: club.name,
            count: club.members.length,
            students: club.members,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, authorize('coordinator', 'admin'), uploadImage('clubs'), async (req, res) => {
    try {
        const { name, description, category, facultyAdvisor } = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required.' });
        }

        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const uploadedImage = req.file ? `/uploads/clubs/${req.file.filename}` : '';
        const autoImage = `https://picsum.photos/seed/${encodeURIComponent((name || 'club').replace(/\s+/g, '-').toLowerCase())}/600/400`;
        const image = uploadedImage || autoImage;

        const club = await Club.create({
            name,
            description,
            category,
            facultyAdvisor,
            coordinator: req.user._id,
            status,
            image
        });
        return res.status(201).json(club);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A club with this exact name already exists! Please choose a different name.' });
        }
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Update a club
// @route   PUT /api/clubs/:id
// @access  Private/Coordinator/Admin
router.put('/:id', protect, authorize('coordinator', 'admin'), async (req, res) => {
    try {
        const { name, description, category, facultyAdvisor } = req.body;
        const club = await Club.findById(req.params.id);

        if (!club) return res.status(404).json({ message: 'Club not found' });

        // Only allow coordinator of the club or admin to update
        if (club.coordinator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        club.name = name || club.name;
        club.description = description || club.description;
        club.category = category || club.category;
        club.facultyAdvisor = facultyAdvisor || club.facultyAdvisor;

        // If coordinator edits, reset to pending if it was rejected
        if (req.user.role === 'coordinator' && club.status === 'rejected') {
            club.status = 'pending';
        }

        const updatedClub = await club.save();
        return res.json(updatedClub);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Approve/Reject club
// @route   PUT /api/clubs/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        club.status = status;
        const updatedClub = await club.save();
        return res.json(updatedClub);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Join a club
// @route   POST /api/clubs/:id/join
// @access  Private/Student
router.post('/:id/join', protect, authorize('student'), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        const alreadyMember = club.members.some(m => m.toString() === req.user._id.toString());
        if (alreadyMember) {
            return res.status(400).json({ message: 'Already a member' });
        }
        club.members.push(req.user._id);
        await club.save();
        return res.json({ message: 'Joined club successfully', count: club.members.length });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Leave a club
// @route   DELETE /api/clubs/:id/leave
// @access  Private/Student
router.delete('/:id/leave', protect, authorize('student'), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        const idx = club.members.findIndex(m => m.toString() === req.user._id.toString());
        if (idx === -1) return res.status(400).json({ message: 'Not a member' });

        club.members.splice(idx, 1);
        await club.save();
        return res.json({ message: 'Left club successfully', count: club.members.length });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a club (admin only)
// @route   DELETE /api/clubs/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });
        await club.deleteOne();
        return res.json({ message: 'Club deleted successfully.', id: req.params.id });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
