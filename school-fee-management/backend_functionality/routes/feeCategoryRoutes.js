// // backend_functionality/routes/feeCategoryRoutes.js
// const express = require('express');
// const router = express.Router();
// const {
//     createFeeCategory,
//     getAllFeeCategories,
//     getFeeCategoryById,
//     updateFeeCategory,
//     deleteFeeCategory
// } = require('../controllers/feeCategoryController');
// const { protect, authorizeRoles } = require('../middleware/authMiddleware');
//
// // Public routes (for dropdowns)
// router.get('/', getAllFeeCategories); // Anyone can view categories
//
// // Admin-only routes
// router.post('/', protect, authorizeRoles('admin'), createFeeCategory);
// router.get('/:id', protect, getFeeCategoryById);
// router.put('/:id', protect, authorizeRoles('admin'), updateFeeCategory);
// router.delete('/:id', protect, authorizeRoles('admin'), deleteFeeCategory);
//
// module.exports = router;


// backend_functionality/routes/feeCategoryRoutes.js
const express = require('express');
const {
    createFeeCategory,
    getAllFeeCategories,
    getFeeCategoryById,
    updateFeeCategory,
    deleteFeeCategory
} = require('../controllers/feeCategoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('admin'), createFeeCategory);
router.get('/', protect, getAllFeeCategories);
router.get('/:id', protect, getFeeCategoryById);
router.put('/:id', protect, authorizeRoles('admin'), updateFeeCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteFeeCategory);

module.exports = router;