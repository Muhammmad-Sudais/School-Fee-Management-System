// backend_functionality/controllers/paymentController.js
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const mongoose = require('mongoose');

// @desc    Create payment record
// @route   POST /api/payments
// @access  Private (admin, accountant)
const createPayment = async (req, res) => {
    try {
        let { studentId, paymentItems, paymentMethod, notes, feeStructureId, amountPaid, transactionId } = req.body;

        // Validate student
        let student = await Student.findById(studentId).populate('feeStructure');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Handle Fee Structure Assignment
        if (feeStructureId) {
            if (!student.feeStructure || student.feeStructure._id.toString() !== feeStructureId) {
                student.feeStructure = feeStructureId;
                await student.save();
                student = await Student.findById(studentId).populate('feeStructure');
            }
        }

        if (!student.feeStructure) {
            return res.status(400).json({ error: 'Student has no assigned fee structure' });
        }

        // Get fee structure
        const feeStructure = await FeeStructure.findById(student.feeStructure._id)
            .populate('feeCategories.category');

        if (!feeStructure) {
            return res.status(400).json({ error: 'Invalid fee structure' });
        }

        // Fetch previous payments for balance calculation
        const previousPayments = await Payment.find({
            student: studentId,
            feeStructure: student.feeStructure._id
        });

        // Auto-distribute payment if items are not provided
        if (!paymentItems || paymentItems.length === 0) {
            if (!amountPaid) {
                return res.status(400).json({ error: 'Payment items or total Amount Paid is required' });
            }

            paymentItems = [];
            let remainingAmount = parseFloat(amountPaid);

            for (const fc of feeStructure.feeCategories) {
                if (remainingAmount <= 0) break;

                const categoryId = fc.category._id.toString();
                const totalAmountForCat = fc.amount;

                // Calculate how much already paid for this category
                let alreadyPaid = 0;
                previousPayments.forEach(p => {
                    const item = p.paymentItems.find(pi => pi.feeCategory.toString() === categoryId);
                    if (item) {
                        alreadyPaid += item.amountPaid;
                    }
                });

                const outstanding = totalAmountForCat - alreadyPaid;

                if (outstanding > 0) {
                    const paymentForThis = Math.min(outstanding, remainingAmount);
                    paymentItems.push({
                        feeCategory: categoryId,
                        amountDue: totalAmountForCat,
                        amountPaid: paymentForThis
                    });
                    remainingAmount -= paymentForThis;
                }
            }
        }

        // Validate payment items
        let totalPaid = 0;
        const validatedPaymentItems = [];

        for (const item of paymentItems) {
            // Find corresponding fee category in structure
            const feeCat = feeStructure.feeCategories.find(fc =>
                fc.category._id.toString() === item.feeCategory.toString()
            );

            if (!feeCat) {
                return res.status(400).json({ error: 'Invalid fee category' });
            }

            const amountDue = feeCat.amount;
            const amountPaidCurrent = parseFloat(item.amountPaid) || 0;

            validatedPaymentItems.push({
                feeCategory: item.feeCategory,
                amountDue: amountDue,
                amountPaid: amountPaidCurrent,
                isPaid: false // Will be updated if we track per-category status fully, but simplified for now
            });

            totalPaid += amountPaidCurrent;
        }

        // Calculate totals
        const prevTotalPaid = previousPayments.reduce((sum, p) => sum + p.amountPaid, 0);
        const globalTotalPaid = prevTotalPaid + totalPaid;
        const balance = feeStructure.totalAmount - globalTotalPaid;

        // Create payment record
        const payment = await Payment.create({
            student: studentId,
            feeStructure: student.feeStructure._id,
            academicYear: feeStructure.academicYear,
            totalAmount: feeStructure.totalAmount,
            amountPaid: totalPaid,
            balance,
            paymentItems: validatedPaymentItems,
            paymentMethod,
            transactionId,
            notes,
            createdBy: req.user._id
        });

        res.status(201).json({
            message: 'Payment recorded successfully',
            payment: {
                id: payment._id,
                studentName: student.name,
                totalAmount: payment.totalAmount,
                amountPaid: payment.amountPaid,
                balance: payment.balance,
                paymentDate: payment.paymentDate
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

// @desc    Get payment history for student
// @route   GET /api/payments/student/:studentId
// @access  Private (admin, accountant, parent)
const getStudentPaymentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Verify access (admin/accountant or parent of student)
        const student = await Student.findById(studentId).populate('parent');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const isParent = student.parent?.user?.toString() === req.user.id;
        const isAdminOrAccountant = ['admin', 'accountant'].includes(req.user.role);

        if (!isAdminOrAccountant && !isParent) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const payments = await Payment.find({ student: studentId })
            .populate('createdBy', 'name')
            .populate('feeStructure', 'class academicYear')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

// @desc    Get all payments (admin/accountant)
// @route   GET /api/payments
// @access  Private (admin, accountant)
const getAllPayments = async (req, res) => {
    try {
        const { studentId, class: studentClass, startDate, endDate } = req.query;

        let filter = {};

        if (studentId) {
            filter.student = studentId;
        }

        if (startDate || endDate) {
            filter.paymentDate = {};
            if (startDate) filter.paymentDate.$gte = new Date(startDate);
            if (endDate) filter.paymentDate.$lte = new Date(endDate);
        }

        // Get payments with populated data
        const payments = await Payment.find(filter)
            .populate('student', 'name rollNumber class')
            .populate('feeStructure', 'class academicYear')
            .populate('createdBy', 'name')
            .sort({ paymentDate: -1 });

        // Filter by class if specified
        let filteredPayments = payments;
        if (studentClass) {
            filteredPayments = payments.filter(p => p.feeStructure?.class === studentClass);
        }

        res.json(filteredPayments);
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

module.exports = {
    createPayment,
    getStudentPaymentHistory,
    getAllPayments
};