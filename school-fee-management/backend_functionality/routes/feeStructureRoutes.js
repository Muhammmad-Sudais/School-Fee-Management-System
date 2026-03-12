// backend_functionality/routes/feeStructureRoutes.js
const express = require('express');
const {
    createFeeStructure,
    getFeeStructures,
    getFeeStructureById,
    assignFeeStructureToStudent,
    updateFeeStructure,
    deleteFeeStructure,
} = require('../controllers/feeStructureController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Fee Structures
router.post('/', protect, authorizeRoles('admin'), (req, res, next) => {
    createFeeStructure(req, res).catch(next);
});

// Update fee structure
router.put('/:id', protect, authorizeRoles('admin'), (req, res, next) => {
    updateFeeStructure(req, res).catch(next);
});

// Delete fee structure
router.delete('/:id', protect, authorizeRoles('admin'), (req, res, next) => {
    deleteFeeStructure(req, res).catch(next);
});

router.get('/', protect, (req, res, next) => {
    getFeeStructures(req, res).catch(next);
});

router.get('/:id', protect, (req, res, next) => {
    getFeeStructureById(req, res).catch(next);
});

router.post('/assign/:studentId', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    assignFeeStructureToStudent(req, res).catch(next);
});

module.exports = router;