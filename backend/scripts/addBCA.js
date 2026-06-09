const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Event = require('../models/Event');
const Club = require('../models/Club');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createBCAStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // 1. Get existing BCA students
        let bcaStudents = await User.find({ role: 'student', course: 'BCA' });
        console.log(`Initial BCA Students: ${bcaStudents.length}`);

        // 2. If we have less than 7 BCA students, let's convert some existing students to BCA
        // or just create new mock ones so we have at least 15 BCA students to pick from.
        if (bcaStudents.length < 15) {
            const extraNeeded = 15 - bcaStudents.length;
            const nonBcaStudents = await User.find({ role: 'student', course: { $ne: 'BCA' } }).limit(extraNeeded);
            for (let s of nonBcaStudents) {
                s.course = 'BCA';
                await s.save();
                bcaStudents.push(s);
            }
            console.log(`Converted ${extraNeeded} students to BCA.`);
        }

        // 3. Add 6-7 random BCA students to each event and club
        const events = await Event.find();
        let eventsUpdated = 0;
        for (let event of events) {
            // Pick 6-7 randomly
            const count = Math.floor(Math.random() * 2) + 6; // 6 or 7
            
            // Shuffle bcaStudents
            const shuffled = bcaStudents.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            
            let changed = false;
            for (const s of selected) {
                if (!event.attendees.includes(s._id)) {
                    event.attendees.push(s._id);
                    changed = true;
                }
            }
            if (changed) {
                await event.save();
                eventsUpdated++;
            }
        }

        const clubs = await Club.find();
        let clubsUpdated = 0;
        for (let club of clubs) {
            const count = Math.floor(Math.random() * 2) + 6; // 6 or 7
            const shuffled = bcaStudents.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            
            let changed = false;
            for (const s of selected) {
                if (!club.members.includes(s._id)) {
                    club.members.push(s._id);
                    changed = true;
                }
            }
            if (changed) {
                await club.save();
                clubsUpdated++;
            }
        }

        console.log(`Added BCA students to ${eventsUpdated} events and ${clubsUpdated} clubs.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createBCAStudents();
