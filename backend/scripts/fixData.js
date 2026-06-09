const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const VALID_COURSES = ['BCOM', 'BBA', 'BCA', 'MCA', 'MBA'];
const VALID_SECTIONS = ['A', 'B', 'C'];

const generateValidRegNumber = () => {
    const letters = ['A', 'B', 'C'];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const digits = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
    return `23${letter}${digits}`;
};

const mapCourse = (old) => {
    if(!old) return 'BCA';
    const c = old.toUpperCase().trim();
    if (c === 'B.COM') return 'BCOM';
    if (c === 'B.SC CS' || c === 'B.TECH') return 'BCA';
    if (VALID_COURSES.includes(c)) return c;
    return 'BCA'; // Fallback
};

const scrubDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected. Beginning Data Scrubbing...');

        const users = await User.find({ role: 'student' });
        let updatedCount = 0;

        for (let user of users) {
            let changed = false;

            // Fix Reg Number
            const regRegex = /^23[ABC]\d{5}$/;
            if (!user.regNumber || !regRegex.test(user.regNumber)) {
                user.regNumber = generateValidRegNumber();
                changed = true;
            }

            // Fix Course
            if (!VALID_COURSES.includes(user.course)) {
                user.course = mapCourse(user.course);
                changed = true;
            }

            if (changed) {
                // Must bypass hooks if we want to mass save or we just rely on standard save
                await user.save({ validateBeforeSave: true });
                updatedCount++;
            }
        }

        console.log(`Successfully formatted and scrubbed ${updatedCount} student records across the database.`);
        process.exit();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

scrubDatabase();
