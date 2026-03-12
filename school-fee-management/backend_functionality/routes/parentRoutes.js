// backend_functionality/routes/parentRoutes.js
const express = require('express');
const { createParent, getParentProfile, getParents, updateParent, updateParentProfile, deleteParent } = require('../controllers/parentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin/Accountant: get/create parents
router.get('/', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    getParents(req, res).catch(next);
});

router.post('/', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    createParent(req, res).catch(next);
});

router.put('/:id', protect, authorizeRoles('admin', 'accountant'), (req, res, next) => {
    updateParent(req, res).catch(next);
});

router.delete('/:id', protect, authorizeRoles('admin'), (req, res, next) => {
    deleteParent(req, res).catch(next);
});

// Parent: get/update own profile
router.get('/me', protect, authorizeRoles('parent'), (req, res, next) => {
    getParentProfile(req, res).catch(next);
});

router.put('/me', protect, authorizeRoles('parent'), (req, res, next) => {
    updateParentProfile(req, res).catch(next);
});

module.exports = router;