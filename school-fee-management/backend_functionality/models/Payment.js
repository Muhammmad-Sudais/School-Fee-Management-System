// backend_functionality/models/Payment.js
const mongoose = require('mongoose');

const paymentItemSchema = new mongoose.Schema({
    feeCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeCategory',
        required: true
    },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false }
});

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    feeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeStructure',
        required: true
    },
    academicYear: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true },
    paymentItems: [paymentItemSchema],
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'credit_card', 'other'],
        required: true
    },
    transactionId: String,
    paymentDate: { type: Date, default: Date.now },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);