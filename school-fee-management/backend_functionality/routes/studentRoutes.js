// backend_functionality/routes/studentRoutes.js
const express = require('express');
const {
    createStudent,
    getAllStudents,
    getStudentById,
    getMyStudents,
    getStudentsWithFees,
    getStudentsWithPendingFees,
    getStudentProfile,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    createStudent(req, res).catch(next);
});

router.get('/', protect, (req, res, next) => {
    getAllStudents(req, res).catch(next);
});

// Students with submitted fees
router.get('/with-fees', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    getStudentsWithFees(req, res).catch(next);
});

// Students with pending fees - ✅ SPECIFIC ROUTE BEFORE DYNAMIC ROUTE
router.get('/pending-fees', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    getStudentsWithPendingFees(req, res).catch(next); // ✅ Now properly defined
});

router.get('/my', protect, (req, res, next) => {
    getMyStudents(req, res).catch(next);
});

// Student Profile - ✅ MUST BE BEFORE /:id
router.get('/profile', protect, (req, res, next) => {
    getStudentProfile(req, res).catch(next);
});

// Student by ID - ✅ DYNAMIC ROUTE LAST
router.get('/:id', protect, (req, res, next) => {
    getStudentById(req, res).catch(next);
});

router.put('/:id', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    updateStudent(req, res).catch(next);
});

router.delete('/:id', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    deleteStudent(req, res).catch(next);
});

// ... other routes (update, delete, etc.)

module.exports = router;