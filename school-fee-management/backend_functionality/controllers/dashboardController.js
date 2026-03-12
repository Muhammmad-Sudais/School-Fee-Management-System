// backend_functionality/controllers/dashboardController.js
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Parent = require('../models/Parent');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (admin, accountant)
const getDashboardStats = async (req, res) => {
    try {
        // Total students
        const totalStudents = await Student.countDocuments();

        // Students with fee structures
        const studentsWithFeeStructures = await Student.countDocuments({ feeStructure: { $ne: null } });

        // Students with pending fees
        const allStudents = await Student.find({ feeStructure: { $ne: null } })
            .populate('feeStructure', 'totalAmount');

        const allPayments = await Payment.find().lean();
        const paymentMap = new Map();

        allPayments.forEach(payment => {
            const studentId = payment.student.toString();
            if (!paymentMap.has(studentId)) {
                paymentMap.set(studentId, 0);
            }
            paymentMap.set(studentId, paymentMap.get(studentId) + payment.amountPaid);
        });

        let studentsWithPendingFees = 0;
        let totalOutstanding = 0;
        let totalCollected = 0;

        allStudents.forEach(student => {
            const totalAmount = student.feeStructure?.totalAmount || 0;
            const amountPaid = paymentMap.get(student._id.toString()) || 0;
            const balance = totalAmount - amountPaid;

            totalCollected += amountPaid;

            if (balance > 0) {
                studentsWithPendingFees++;
                totalOutstanding += balance;
            }
        });

        // Students with submitted fees
        const studentsWithSubmittedFees = studentsWithFeeStructures - studentsWithPendingFees;

        // Recent payments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentPayments = await Payment.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // User counts by role
        const adminCount = await User.countDocuments({ role: 'admin' });
        const accountantCount = await User.countDocuments({ role: 'accountant' });
        const parentCount = await User.countDocuments({ role: 'parent' });

        const stats = {
            totalStudents,
            studentsWithFeeStructures,
            studentsWithPendingFees,
            studentsWithSubmittedFees,
            totalOutstanding,
            totalCollected,
            recentPayments,
            userCounts: {
                admin: adminCount,
                accountant: accountantCount,
                parent: parentCount
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

// @desc    Get dashboard statistics for Student/Parent
// @route   GET /api/dashboard/stats/personal
// @access  Private (student, parent)
const getStudentParentDashboardStats = async (req, res) => {
    try {
        let stats = {
            totalFees: 0,
            amountPaid: 0,
            pendingBalance: 0,
            paymentCount: 0,
            studentCount: 0
        };

        if (req.user.role === 'student') {
            // Find student by email
            const student = await Student.findOne({ email: req.user.email })
                .populate('feeStructure', 'totalAmount');

            if (!student) {
                return res.status(404).json({ error: 'Student profile not found' });
            }

            // Get payments
            const payments = await Payment.find({ student: student._id });
            const totalPaid = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);

            stats.studentCount = 1;
            stats.totalFees = student.feeStructure?.totalAmount || 0;
            stats.amountPaid = totalPaid;
            stats.pendingBalance = Math.max(0, stats.totalFees - totalPaid);
            stats.paymentCount = payments.length;

        } else if (req.user.role === 'parent') {
            // Find parent profile
            const parent = await Parent.findOne({ user: req.user.id }); // Parent model uses user ID
            if (!parent) {
                return res.status(404).json({ error: 'Parent profile not found' });
            }

            // Find all kids
            const kids = await Student.find({ parent: parent._id })
                .populate('feeStructure', 'totalAmount');

            stats.studentCount = kids.length;

            // Calculate stats for all kids
            for (const kid of kids) {
                const totalFee = kid.feeStructure?.totalAmount || 0;
                stats.totalFees += totalFee;

                const payments = await Payment.find({ student: kid._id });
                const totalPaid = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);

                stats.amountPaid += totalPaid;
                stats.paymentCount += payments.length;
                stats.pendingBalance += Math.max(0, totalFee - totalPaid);
            }
        }

        res.json(stats);
    } catch (error) {
        console.error('Personal dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch personal dashboard statistics' });
    }
};

module.exports = { getDashboardStats, getStudentParentDashboardStats };