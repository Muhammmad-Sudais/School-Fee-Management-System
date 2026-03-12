// backend_functionality/controllers/parentController.js
const Parent = require('../models/Parent');
const User = require('../models/User');

// @desc    Create parent (only for admin/accountant)
// @route   POST /api/parents
// @access  Private (admin, accountant)
const createParent = async (req, res) => {
    try {
        const { userId, contact, address } = req.body;

        // Ensure user exists and is a parent
        const user = await User.findById(userId);
        if (!user || user.role !== 'parent') {
            return res.status(400).json({ error: 'User must exist and have role "parent"' });
        }

        const parentExists = await Parent.findOne({ user: userId });
        if (parentExists) {
            return res.status(400).json({ error: 'Parent already exists for this user' });
        }

        const parent = await Parent.create({
            user: userId,
            contact,
            address
        });

        res.status(201).json(parent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get parent profile (for logged-in parent)
// @route   GET /api/parents/me
// @access  Private (parent)
const getParentProfile = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user.id }).populate('user', 'name email');
        if (!parent) {
            return res.status(404).json({ error: 'Parent profile not found' });
        }
        res.json(parent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get all parents (admin/accountant)
// @route   GET /api/parents
// @access  Private (admin, accountant)
const getParents = async (req, res) => {
    try {
        const parents = await Parent.find()
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });
        res.json(parents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateParentProfile = async (req, res) => {
    try {
        const { contact, address } = req.body;
        const parent = await Parent.findOne({ user: req.user.id });

        if (!parent) {
            return res.status(404).json({ error: 'Parent profile not found' });
        }

        parent.contact = contact || parent.contact;
        parent.address = address || parent.address;

        const updatedParent = await parent.save();
        const populatedParent = await Parent.findById(updatedParent._id).populate('user', 'name email');
        res.json(populatedParent);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateParent = async (req, res) => {
    try {
        const { contact, address } = req.body;
        const parent = await Parent.findById(req.params.id);

        if (!parent) {
            return res.status(404).json({ error: 'Parent record not found' });
        }

        parent.contact = contact || parent.contact;
        parent.address = address || parent.address;

        const updatedParent = await parent.save();
        const populatedParent = await Parent.findById(updatedParent._id).populate('user', 'name email');
        res.json(populatedParent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteParent = async (req, res) => {
    try {
        const { id } = req.params;
        const parent = await Parent.findById(id);

        if (!parent) {
            return res.status(404).json({ error: 'Parent record not found' });
        }

        // Check if parent has any students
        const Student = require('../models/Student');
        const studentCount = await Student.countDocuments({ parent: id });
        if (studentCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete parent because they have students registered. Please transfer or remove students first.'
            });
        }

        // Delete associated user account if it exists
        if (parent.user) {
            await User.findByIdAndDelete(parent.user);
        }

        // Delete parent record
        await Parent.findByIdAndDelete(id);

        res.json({ message: 'Parent and associated user account deleted successfully' });
    } catch (error) {
        console.error('Delete parent error:', error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createParent,
    getParentProfile,
    getParents,
    updateParentProfile,
    updateParent,
    deleteParent
};