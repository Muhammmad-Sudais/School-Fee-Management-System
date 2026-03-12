// backend_functionality/controllers/feeCategoryController.js
const FeeCategory = require('../models/FeeCategory');
const FeeStructure = require('../models/FeeStructure');

// @desc    Create a new fee category
// @route   POST /api/fee-categories
// @access  Private (admin)
const createFeeCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Check for duplicate name (case-insensitive)
        const existingCategory = await FeeCategory.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' }
        });

        if (existingCategory) {
            return res.status(400).json({ error: 'Category name already exists' });
        }

        const feeCategory = await FeeCategory.create({
            name: name.trim(),
            description: description ? description.trim() : ''
        });

        res.status(201).json(feeCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        console.error('Create fee category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get all fee categories
// @route   GET /api/fee-categories
// @access  Private
const getAllFeeCategories = async (req, res) => {
    try {
        const { isActive } = req.query;
        let filter = {};

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const categories = await FeeCategory.find(filter).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Get fee categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get single fee category
// @route   GET /api/fee-categories/:id
// @access  Private
const getFeeCategoryById = async (req, res) => {
    try {
        const category = await FeeCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Fee category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error('Get fee category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update fee category
// @route   PUT /api/fee-categories/:id
// @access  Private (admin)
const updateFeeCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ error: 'Category name cannot be empty' });
            }

            // Check for duplicate name (excluding current category)
            const existingCategory = await FeeCategory.findOne({
                name: { $regex: `^${name.trim()}$`, $options: 'i' },
                _id: { $ne: req.params.id }
            });

            if (existingCategory) {
                return res.status(400).json({ error: 'Category name already exists' });
            }

            updates.name = name.trim();
        }

        if (description !== undefined) {
            updates.description = description ? description.trim() : '';
        }

        if (isActive !== undefined) {
            updates.isActive = Boolean(isActive);
        }

        const category = await FeeCategory.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ error: 'Fee category not found' });
        }

        res.json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        console.error('Update fee category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Delete fee category
// @route   DELETE /api/fee-categories/:id
// @access  Private (admin)
const deleteFeeCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category is used in any FeeStructure
        const structureUsage = await FeeStructure.findOne({ 'feeCategories.category': id });
        if (structureUsage) {
            return res.status(400).json({
                error: 'Cannot delete category as it is used in one or more fee structures. Please remove it from the structures first.'
            });
        }

        const category = await FeeCategory.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ error: 'Fee category not found' });
        }

        res.json({ message: 'Fee category deleted successfully' });
    } catch (error) {
        console.error('Delete fee category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createFeeCategory,
    getAllFeeCategories,
    getFeeCategoryById,
    updateFeeCategory,
    deleteFeeCategory
};