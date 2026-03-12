// backend_functionality/routes/dashboardRoutes.js
const express = require('express');
const { getDashboardStats, getStudentParentDashboardStats } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    getDashboardStats(req, res).catch(next);
});

router.get('/stats/personal', protect, authorizeRoles('student', 'parent'), (req, res, next) => {
    getStudentParentDashboardStats(req, res).catch(next);
});

module.exports = router;