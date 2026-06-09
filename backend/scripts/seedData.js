const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Event = require('../models/Event');
const Club = require('../models/Club');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MOCK_FIRST = [
    'Rahul','Priya','Arjun','Sneha','Vikram','Ananya','Rohit','Kavya',
    'Aditya','Meera','Kiran','Deepak','Pooja','Suresh','Divya','Nikhil',
    'Lakshmi','Sanjay','Riya','Manish','Keerthi','Harish','Nandini'
];
const MOCK_LAST = [
    'Sharma','Reddy','Kumar','Nair','Patel','Iyer','Singh','Rao',
    'Verma','Pillai','Joshi','Menon','Gupta','Krishnan','Shetty',
    'Bhat','Mishra'
];
const MOCK_COURSE = ['BCA','MCA','B.Sc CS','B.Com','BBA','B.Tech'];
const SECTIONS = ['A','B','C','D'];

function randomEl(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedRandomStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected.');

        // Verify we have dummy students, create pool of 200 if not
        let dummyStudents = await User.find({ email: { $regex: '@dummy.college.edu$' } });
        
        if (dummyStudents.length < 150) {
            console.log('Generating pool of dummy students in DB...');
            const docs = [];
            for (let i = 0; i < 200; i++) {
                docs.push({
                    name: `${randomEl(MOCK_FIRST)} ${randomEl(MOCK_LAST)}`,
                    email: `dummy_${Date.now()}_${i}@dummy.college.edu`,
                    password: 'password123', // will be hashed by mongoose hook
                    role: 'student',
                    regNumber: 'REG' + Math.floor(100000 + Math.random() * 900000),
                    semester: Math.floor(Math.random() * 6) + 1,
                    section: randomEl(SECTIONS),
                    course: randomEl(MOCK_COURSE),
                });
            }
            // Use create to trigger pre-save hook for password hash
            for (let d of docs) {
                const u = new User(d);
                await u.save();
                dummyStudents.push(u);
            }
            console.log('Created 200 dummy students.');
        }

        // Seed Events
        const events = await Event.find();
        for (let ev of events) {
            if (ev.attendees.length < 5) {
                const count = Math.floor(Math.random() * (50 - 5 + 1)) + 5;
                const shuffled = [...dummyStudents].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, count).map(s => s._id);
                ev.attendees = [...new Set([...ev.attendees, ...selected])];
                await ev.save();
                console.log(`Seeded event ${ev.title} with ${count} students.`);
            }
        }

        // Seed Clubs
        const clubs = await Club.find();
        for (let club of clubs) {
            if (club.members.length < 10) {
                const count = Math.floor(Math.random() * (35 - 10 + 1)) + 10;
                const shuffled = [...dummyStudents].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, count).map(s => s._id);
                club.members = [...new Set([...club.members, ...selected])];
                await club.save();
                console.log(`Seeded club ${club.name} with ${count} members.`);
            }
        }

        console.log('Database seating complete!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedRandomStudents();
