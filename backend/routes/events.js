const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/upload');

// @desc    Get all events (Approved only)
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({ status: 'approved' })
            .sort({ date: 1 })
            .populate('club', 'name')
            .populate('createdBy', 'name email regNumber semester section course')
            .populate('attendees', 'name email regNumber semester section course');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get ALL events (Admin only)
// @route   GET /api/events/admin-all
// @access  Private/Admin
router.get('/admin-all', protect, authorize('admin'), async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ createdAt: -1 })
            .populate('club', 'name')
            .populate('createdBy', 'name email regNumber semester section course')
            .populate('attendees', 'name email regNumber semester section course');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get Coordinator's own events
// @route   GET /api/events/my-events
// @access  Private/Coordinator
router.get('/my-events', protect, authorize('coordinator'), async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate('club', 'name')
            .populate('attendees', 'name email regNumber semester section course');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// @desc    Get registrations (students) for a specific event
// @route   GET /api/events/:id/registrations
// @access  Private/Admin
router.get('/:id/registrations', protect, authorize('admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('attendees', 'name email regNumber semester section course');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        return res.json({
            eventTitle: event.title,
            count: event.attendees.length,
            students: event.attendees,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// @desc    Create an event
// @route   POST /api/events
// @access  Private/Coordinator/Admin
router.post('/', protect, authorize('coordinator', 'admin'), uploadImage('events'), async (req, res) => {
    try {
        const { title, description, category, date, venue, club } = req.body;
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const uploadedImage = req.file ? `/uploads/events/${req.file.filename}` : '';
        const autoImage = `https://picsum.photos/seed/${encodeURIComponent((title || 'event').replace(/\s+/g, '-').toLowerCase())}/600/400`;
        const image = uploadedImage || autoImage;
        const event = new Event({
            title,
            description,
            category: category || 'General',
            date,
            venue,
            club: club || null,
            createdBy: req.user._id,
            status,
            image,
        });
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Approve/Reject event
// @route   PUT /api/events/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        event.status = status;
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle event registration (join / leave)
// @route   POST /api/events/:id/register
// @access  Private/Student
router.post('/:id/register', protect, authorize('student'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const userId = req.user._id;
        const index = event.attendees.findIndex(id => id.toString() === userId.toString());

        if (index === -1) {
            event.attendees.push(userId);
            await event.save();
            res.json({ message: 'Registered successfully', action: 'registered', count: event.attendees.length });
        } else {
            event.attendees.splice(index, 1);
            await event.save();
            res.json({ message: 'Unregistered successfully', action: 'unregistered', count: event.attendees.length });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete an event (removes all attendee references)
// @route   DELETE /api/events/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await event.deleteOne();
        res.json({ message: 'Event deleted successfully.', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
