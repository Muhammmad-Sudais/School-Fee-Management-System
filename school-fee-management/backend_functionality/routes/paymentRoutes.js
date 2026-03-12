// backend_functionality/routes/paymentRoutes.js
const express = require('express');
const {
    createPayment,
    getStudentPaymentHistory,
    getAllPayments
} = require('../controllers/paymentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin/Accountant routes
router.post('/', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    createPayment(req, res).catch(next);
});

router.get('/', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    getAllPayments(req, res).catch(next);
});

// Student/Parent routes
router.get('/student/:studentId', protect, (req, res, next) => {
    getStudentPaymentHistory(req, res).catch(next);
});

module.exports = router;