// backend_functionality/routes/adminRoutes.js
const express = require('express');
const { registerParentAndStudent } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register-parent-student', protect, authorizeRoles('admin'), (req, res, next) => {
    registerParentAndStudent(req, res).catch(next);
});

module.exports = router;