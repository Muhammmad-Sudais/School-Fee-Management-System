// backend_functionality/controllers/feeStructureController.js
const FeeCategory = require('../models/FeeCategory');
const FeeStructure = require('../models/FeeStructure');
const Student = require('../models/Student'); // ✅ Added
const mongoose = require('mongoose');

// @desc    Create a fee category (e.g., "Tuition", "Transport")
// @route   POST /api/fee-categories
// @access  Private (admin)
const createFeeCategory = async (req, res) => {
    try {
        const { name, amount, description } = req.body;
        const category = await FeeCategory.create({ name, amount, description });
        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Fee category already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get all fee categories
// @route   GET /api/fee-categories
// @access  Private
const getFeeCategories = async (req, res) => {
    try {
        const categories = await FeeCategory.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create fee structure for a class
// @route   POST /api/fee-structures
// @access  Private (admin)
const createFeeStructure = async (req, res) => {
    try {
        const { class: studentClass, academicYear, feeCategories } = req.body;
        const createdBy = req.user._id;

        if (!Array.isArray(feeCategories) || feeCategories.length === 0) {
            return res.status(400).json({ error: 'At least one fee category is required' });
        }

        let totalAmount = 0;
        const validatedCategories = [];

        for (const item of feeCategories) {
            if (!item.category || !mongoose.Types.ObjectId.isValid(item.category)) {
                return res.status(400).json({ error: 'Invalid category ID' });
            }
            if (typeof item.amount !== 'number' || item.amount <= 0) {
                return res.status(400).json({ error: 'Invalid amount for fee category' });
            }

            validatedCategories.push({
                category: item.category,
                amount: item.amount
            });
            totalAmount += item.amount;
        }

        const feeStructure = await FeeStructure.create({
            class: studentClass.trim(),
            academicYear: academicYear.trim(),
            totalAmount,
            feeCategories: validatedCategories,
            createdBy
        });

        res.status(201).json(feeStructure);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Fee structure already exists for this class and year' });
        }
        console.error('Create fee structure error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get all fee structures
// @route   GET /api/fee-structures
// @access  Private
const getFeeStructures = async (req, res) => {
    try {
        const structures = await FeeStructure.find()
            .populate('feeCategories.category', 'name')
            .populate('createdBy', 'name email')
            .sort({ class: 1, academicYear: -1 });
        res.json(structures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get fee structure by ID
// @route   GET /api/fee-structures/:id
// @access  Private
const getFeeStructureById = async (req, res) => {
    try {
        const structure = await FeeStructure.findById(req.params.id)
            .populate('feeCategories.category', 'name')
            .populate('createdBy', 'name');
        if (!structure) {
            return res.status(404).json({ error: 'Fee structure not found' });
        }
        res.json(structure);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Assign fee structure to student
// @route   POST /api/fee-structures/assign/:studentId
// @access  Private (admin, accountant)
const assignFeeStructureToStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { feeStructureId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }
        if (!mongoose.Types.ObjectId.isValid(feeStructureId)) {
            return res.status(400).json({ error: 'Invalid fee structure ID' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const feeStructure = await FeeStructure.findById(feeStructureId);
        if (!feeStructure) {
            return res.status(404).json({ error: 'Fee structure not found' });
        }

        student.feeStructure = feeStructureId;
        await student.save();

        res.json({
            message: 'Fee structure assigned successfully',
            student: {
                id: student._id,
                name: student.name,
                feeStructure: {
                    id: feeStructure._id,
                    class: feeStructure.class,
                    academicYear: feeStructure.academicYear,
                    totalAmount: feeStructure.totalAmount
                }
            }
        });
    } catch (error) {
        console.error('Assign fee structure error:', error);
        res.status(500).json({ error: 'Failed to assign fee structure' });
    }
};

// For backward compatibility
const getAllFeeStructures = async (req, res) => {
    try {
        const feeStructures = await FeeStructure.find()
            .populate('feeCategories.category', 'name')
            .sort({ academicYear: -1, class: 1 });
        res.json(feeStructures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update fee structure
// @route   PUT /api/fee-structures/:id
// @access  Private (admin)
const updateFeeStructure = async (req, res) => {
    try {
        const { id } = req.params;
        const { class: studentClass, academicYear, feeCategories } = req.body;

        // Validate fee categories
        if (!Array.isArray(feeCategories) || feeCategories.length === 0) {
            return res.status(400).json({ error: 'At least one fee category is required' });
        }

        let totalAmount = 0;
        const validatedCategories = [];

        for (const item of feeCategories) {
            if (!item.category || !mongoose.Types.ObjectId.isValid(item.category)) {
                return res.status(400).json({ error: 'Invalid category ID' });
            }
            if (typeof item.amount !== 'number' || item.amount < 0) {
                return res.status(400).json({ error: 'Invalid amount for fee category' });
            }

            validatedCategories.push({
                category: item.category,
                amount: item.amount
            });
            totalAmount += item.amount;
        }

        const updatedFeeStructure = await FeeStructure.findByIdAndUpdate(
            id,
            {
                class: studentClass.trim(),
                academicYear: academicYear.trim(),
                totalAmount,
                feeCategories: validatedCategories
            },
            { new: true, runValidators: true }
        );

        if (!updatedFeeStructure) {
            return res.status(404).json({ error: 'Fee structure not found' });
        }

        res.json(updatedFeeStructure);
    } catch (error) {
        console.error('Update fee structure error:', error);
        res.status(500).json({ error: 'Failed to update fee structure' });
    }
};

const deleteFeeStructure = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if fee structure is assigned to any student
        const studentCount = await Student.countDocuments({ feeStructure: id });
        if (studentCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete fee structure because it is assigned to students.'
            });
        }

        const feeStructure = await FeeStructure.findByIdAndDelete(id);
        if (!feeStructure) {
            return res.status(404).json({ error: 'Fee structure not found' });
        }

        res.json({ message: 'Fee structure deleted successfully' });
    } catch (error) {
        console.error('Delete fee structure error:', error);
        res.status(500).json({ error: 'Failed to delete fee structure' });
    }
};


module.exports = {
    createFeeCategory,
    getFeeCategories,
    createFeeStructure,
    getFeeStructures,
    getFeeStructureById,
    assignFeeStructureToStudent,
    getAllFeeStructures,
    updateFeeStructure,
    deleteFeeStructure

};