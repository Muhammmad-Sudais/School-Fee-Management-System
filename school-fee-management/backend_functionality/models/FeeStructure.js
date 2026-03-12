// backend_functionality/models/FeeStructure.js
const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
    class: {
        type: String,
        required: [true, 'Class is required'],
        trim: true
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        match: [/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY (e.g., 2025-2026)']
    },
    feeCategories: [{
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FeeCategory',
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});



// Ensure unique class + academicYear combo
feeStructureSchema.index({ class: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);