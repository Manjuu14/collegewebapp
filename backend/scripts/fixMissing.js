const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixMissingInfo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const users = await User.find({ role: 'student' });
        const semesters = ['1', '2', '3', '4', '5', '6'];
        const sections = ['A', 'B', 'C', 'D'];
        let updatedCount = 0;

        for (let user of users) {
             let changed = false;
             
             if (!user.semester) {
                 user.semester = semesters[Math.floor(Math.random() * semesters.length)];
                 changed = true;
             }
             
             if (!user.section) {
                 user.section = sections[Math.floor(Math.random() * sections.length)];
                 changed = true;
             }
             
             if (changed) {
                 await user.save({ validateBeforeSave: true });
                 updatedCount++;
             }
        }

        console.log(`Updated ${updatedCount} students with missing semester/section.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixMissingInfo();
