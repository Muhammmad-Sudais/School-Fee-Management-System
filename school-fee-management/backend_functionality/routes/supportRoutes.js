// backend_functionality/routes/supportRoutes.js
const express = require('express');
const { createTicket, getMyTickets, getAllTickets, updateTicket } = require('../controllers/supportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Common: create ticket, see my tickets
router.post('/', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);

// Admin: see all tickets, update ticket
router.get('/', protect, authorizeRoles('admin', 'accountant'), getAllTickets);
router.put('/:id', protect, authorizeRoles('admin', 'accountant'), updateTicket);

module.exports = router;
