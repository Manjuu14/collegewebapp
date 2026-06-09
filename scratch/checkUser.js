const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');

dotenv.config({ path: './backend/.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ role: { $in: ['admin', 'coordinator'] } }).lean();
    console.log(users.map(u => ({ email: u.email, role: u.role, name: u.name })));
    process.exit();
}
check();
