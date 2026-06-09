const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'coordinator', 'student'],
        default: 'student',
    },
    // Student specific fields
    // Student specific fields
    regNumber: {
        type: String,
        validate: {
            validator: function(v) {
                if (!v && this.role !== 'student') return true; // allow empty for admins
                return /^23[ABC]\d{5}$/.test(v);
            },
            message: props => `${props.value} is an invalid register number. Must match 23[A|B|C]xxxxx.`
        }
    },
    semester: String,
    section: String,
    course: {
        type: String,
        enum: ['BCOM', 'BBA', 'BCA', 'MCA', 'MBA'],
    },
    image: String,
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
