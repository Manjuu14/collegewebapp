const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/college-community';

const verify = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const users = ['admin@gmail.com', 'club@gmail.com', 'manju@gmail.com'];
        for (const email of users) {
            const user = await User.findOne({ email });
            if (!user) {
                console.log(`❌ User NOT found: ${email}`);
                continue;
            }
            const isMatch = await user.matchPassword('123');
            console.log(`${isMatch ? '✅' : '❌'} Password '123' for ${email}: ${isMatch ? 'CORRECT' : 'INVALID'}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
verify();
