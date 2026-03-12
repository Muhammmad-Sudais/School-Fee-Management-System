// backend_functionality/models/Parent.js
const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Parent', parentSchema);