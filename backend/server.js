const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Announcement = require('./models/Announcement');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global JSON body-parse error handler — returns proper JSON instead of empty 400
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON in request body.' });
    }
    next(err);
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));

app.get('/', (req, res) => res.json({ success: true, message: 'Collexa API is running on port ' + PORT }));

// ── 404 fallback — always JSON ────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler — always JSON ───────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ── DB Connect & Seed ─────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log(`MongoDB Connected → ${MONGO_URI}`);
        await seedAll();
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// ── Seed Function ─────────────────────────────────────────────────────────────
// IMPORTANT: Always force-updates passwords so stale hashes never block login.
const seedAll = async () => {
    try {
        const bcrypt = require('bcryptjs');

        // ── 1. Users — upsert with FORCED password reset ──────────────────────
        const userSeeds = [
            { name: 'Admin User', email: 'admin@gmail.com', password: '123', role: 'admin' },
            { name: 'Club Coordinator', email: 'club@gmail.com', password: '123', role: 'coordinator' },
            // Sample students
            { name: 'Manjunath', email: 'manju@gmail.com', password: '123', role: 'student' },
            { name: 'Rahul', email: 'rahul@gmail.com', password: '123', role: 'student' },
            { name: 'Sneha', email: 'sneha@gmail.com', password: '123', role: 'student' },
            { name: 'Priya', email: 'priya@gmail.com', password: '123', role: 'student' },
            { name: 'Arjun', email: 'arjun@gmail.com', password: '123', role: 'student' },
            { name: 'Kavya', email: 'kavya@gmail.com', password: '123', role: 'student' },
            { name: 'Deep', email: 'deep@gmail.com', password: '123', role: 'student' },
        ];

        for (const u of userSeeds) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                await new User(u).save();
                console.log(`✓ Created user: ${u.email}`);
            } else {
                const fresh = await bcrypt.hash(u.password, 10);
                // Only update the password to ensure login works; DO NOT touch the name or other profile info
                await User.updateOne({ email: u.email }, { $set: { password: fresh } });
                console.log(`↻ Synchronized credentials for: ${u.email}`);
            }
        }

        // Resolve all student IDs
        const admin = await User.findOne({ role: 'admin' });
        const coordinator = await User.findOne({ role: 'coordinator' });
        const allStudents = await User.find({ role: 'student' }).sort({ name: 1 });
        const studentIds = allStudents.map(s => s._id);

        if (!admin || !coordinator || studentIds.length === 0) {
            console.error('Seed: could not resolve user IDs — skipping clubs/events/announcements.');
            return;
        }

        // Helper: pick N students in a round-robin fashion
        const pick = (n) => studentIds.slice(0, Math.min(n, studentIds.length));

        // ── 2. Clubs — only seed if collection is empty ────────────────────
        if ((await Club.countDocuments()) === 0) {
            const clubSeeds = [
                { name: 'Tech Innovators', description: 'Lead the coding revolution with hackathons and workshops.', n: 6 },
                { name: 'Debate Society', description: 'Discussing policies, current events, and debate strategy.', n: 4 },
                { name: 'Fitness Club', description: 'Yoga, gym sessions, and diet plans for a healthy campus.', n: 5 },
                { name: 'Music Club', description: 'Create live sessions, record tracks, and perform on stage.', n: 3 },
                { name: 'Web Dev Club', description: 'Workshops on HTML, CSS, React, Node.js and databases.', n: 6 },
                { name: 'Dance Club', description: 'Hip-hop, classical, and contemporary styles for everyone.', n: 4 },
            ];
            for (const c of clubSeeds) {
                const members = studentIds.slice(0, Math.min(c.n, studentIds.length));
                await Club.create({ name: c.name, description: c.description, coordinator: coordinator._id, members });
                console.log(`✓ Seeded club: ${c.name} (${members.length} members)`);
            }
        } else {
            console.log('Skipping Club seeding (collection not empty)');
        }

        // ── 3. Events — only seed if collection is empty ───────────────────
        if ((await Event.countDocuments()) === 0) {
            const eventSeeds = [
                { title: 'Annual Hackathon', description: '24-hour coding marathon. Build innovative solutions.', date: new Date('2026-02-26T09:00:00'), venue: 'Presidency College', status: 'approved' },
                { title: 'Graduation Party', description: 'Celebrating the graduating class of 2026.', date: new Date('2026-05-10T18:00:00'), venue: 'Main Auditorium', status: 'approved' },
                { title: 'Gaming Tournament', description: 'Inter-department e-sports championship (Valorant & FIFA).', date: new Date('2026-03-02T10:00:00'), venue: 'Computer Lab', status: 'approved' },
            ];
            for (const e of eventSeeds) {
                await Event.create({
                    ...e,
                    createdBy: coordinator._id,
                    attendees: [studentIds[0]] // Just pick one student
                });
                console.log(`✓ Seeded event: ${e.title} [${e.status}]`);
            }
        } else {
            console.log('Skipping Event seeding (collection not empty)');
        }

        // ── 4. Announcements — only seed if collection is empty ─────────────
        if ((await Announcement.countDocuments()) === 0) {
            const announcementSeeds = [
                { title: 'Holiday Notice: Shiva Ratri', content: '15th February 2026 is a holiday in observance of Shiva Ratri.' },
                { title: 'Midterm Exam Schedule', content: 'Midterm theory exams commence on Monday, 17th February 2026.' },
                { title: 'Practical Exams', content: 'Midterm practical exams start on Thursday, 5th February 2026.' },
            ];
            for (const a of announcementSeeds) {
                await Announcement.create({ ...a, postedBy: admin._id });
                console.log(`✓ Seeded announcement: ${a.title}`);
            }
        } else {
            console.log('Skipping Announcement seeding (collection not empty)');
        }

        console.log('✓ Seeding complete.');
    } catch (error) {
        console.error('Seeding error:', error.message);
    }
};

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(
            `\n❌ Port ${PORT} is already in use.\n` +
            `   Run: netstat -ano | findstr :${PORT}\n` +
            `   Then kill the PID: taskkill /PID <pid> /F\n` +
            `   OR change PORT in backend/.env to a free port (e.g. 5004).\n`
        );
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

