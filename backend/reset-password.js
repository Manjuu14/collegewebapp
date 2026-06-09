const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/college-community';

const resetPasswords = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const usersToFix = [
            { email: 'manju@gmail.com', password: '123' },
            { email: 'admin@gmail.com', password: '123' },
            { email: 'club@gmail.com', password: '123' }
        ];

        for (const u of usersToFix) {
            const user = await User.findOne({ email: u.email });
            if (user) {
                user.password = u.password;
                await user.save(); // Triggers pre-save hash
                console.log(`Password reset for ${u.email} to '${u.password}'`);
            } else {
                console.log(`User ${u.email} not found, creating...`);
                // Optional: create if missing, but seed should handle it. 
                // Let's just create raw if missing to be sure.
                await User.create({
                    name: 'Test User',
                    email: u.email,
                    password: u.password,
                    role: u.email.includes('admin') ? 'admin' : (u.email.includes('club') ? 'coordinator' : 'student')
                });
                console.log(`Created ${u.email}`);
            }
        }

        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPasswords();
