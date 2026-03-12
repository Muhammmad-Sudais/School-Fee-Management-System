// backend_functionality/controllers/supportController.js
const Support = require('../models/Support');

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;

        const ticket = await Support.create({
            user: req.user.id,
            subject,
            message,
            priority
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get user's tickets
// @route   GET /api/support/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
    try {
        const tickets = await Support.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get all tickets (Admin only)
// @route   GET /api/support
// @access  Private (admin)
const getAllTickets = async (req, res) => {
    try {
        const tickets = await Support.find()
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update ticket status/response (Admin only)
// @route   PUT /api/support/:id
// @access  Private (admin)
const updateTicket = async (req, res) => {
    try {
        const { status, response } = req.body;
        const ticket = await Support.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        ticket.status = status || ticket.status;
        ticket.response = response || ticket.response;

        await ticket.save();
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTicket, getMyTickets, getAllTickets, updateTicket };
