/**
 * Backfill script — fixes all Club/Event image URLs.
 * Replaces broken unsplash source URLs and empty fields
 * with working picsum.photos seed-based URLs.
 *
 * Usage:  node scripts/backfill-images.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Club = require('../models/Club');
const Event = require('../models/Event');

const generateImage = (title) => {
    const seed = (title || 'default').replace(/\s+/g, '-').toLowerCase();
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;
};

const needsFix = (img) => !img || img === '' || img.includes('source.unsplash.com');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // ── Fix Clubs ──
    const clubs = await Club.find();
    let clubFixed = 0;
    for (const club of clubs) {
        if (needsFix(club.image)) {
            club.image = generateImage(club.name);
            await club.save();
            console.log(`  ✓ Club: ${club.name} → ${club.image}`);
            clubFixed++;
        }
    }
    console.log(`Fixed ${clubFixed}/${clubs.length} clubs\n`);

    // ── Fix Events ──
    const events = await Event.find();
    let eventFixed = 0;
    for (const ev of events) {
        if (needsFix(ev.image)) {
            ev.image = generateImage(ev.title);
            await ev.save();
            console.log(`  ✓ Event: ${ev.title} → ${ev.image}`);
            eventFixed++;
        }
    }
    console.log(`Fixed ${eventFixed}/${events.length} events`);

    console.log('\nDone!');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
