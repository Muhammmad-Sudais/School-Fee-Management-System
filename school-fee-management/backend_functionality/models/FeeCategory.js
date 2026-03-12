// backend_functionality/models/FeeCategory.js
const mongoose = require('mongoose');

const feeCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true, // Prevent duplicates like "Tution" vs "Tuition"
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FeeCategory', feeCategorySchema);