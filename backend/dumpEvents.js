const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGO_URI = 'mongodb://127.0.0.1:27017/collegeCommunity';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const events = await Event.find({}).lean();
        console.log("EVENTS IN DB:");
        events.forEach(e => {
            console.log(`Title: ${e.title} | Status: ${e.status} | Image: "${e.image}"`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
