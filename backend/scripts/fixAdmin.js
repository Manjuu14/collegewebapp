const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixAdminRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected. Restoring admin roles...');

        // Find any user with "admin" in their email or name
        const users = await User.find({
            $or: [
                { email: { $regex: /admin/i } },
                { name: { $regex: /admin/i } }
            ]
        });

        if (users.length === 0) {
            console.log('No user with "admin" in their name or email found.');
            process.exit(0);
        }

        for (let user of users) {
            user.role = 'admin';
            await user.save();
            console.log(`Successfully restored Admin privileges for: ${user.name} (${user.email})`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixAdminRoles();
