// backend_functionality/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
    },
    class: {
        type: String,
        required: [true, 'Class is required'],
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent',
        required: true
    },
    feeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeStructure'
    },
    dateOfBirth: {
        type: Date
    },
    admissionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);