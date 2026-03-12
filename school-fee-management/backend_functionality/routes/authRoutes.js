// backend_functionality/routes/authRoutes.js
const express = require('express');
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register and Login: no middleware
router.post('/register', (req, res, next) => {
    register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
    login(req, res).catch(next);
});

// Protected route: /me
router.get('/me', protect, (req, res, next) => {
    getMe(req, res).catch(next);
});

router.put('/me', protect, (req, res, next) => {
    updateMe(req, res).catch(next);
});

module.exports = router;