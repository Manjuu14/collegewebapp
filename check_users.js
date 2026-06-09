const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}).lean();
        console.log("ALL USERS:");
        users.forEach(u => console.log(u.email, u.name, u.role));
        process.exit();
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
}
check();
