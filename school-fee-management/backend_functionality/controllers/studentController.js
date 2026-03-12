// backend_functionality/controllers/studentController.js
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const Payment = require('../models/Payment');

// @desc    Create student (admin/accountant only)
// @route   POST /api/students
// @access  Private (admin, accountant)
const createStudent = async (req, res) => {
    try {
        const { name, email, class: studentClass, rollNumber, parentUserId, dateOfBirth } = req.body;

        // Find parent by user ID
        const parent = await Parent.findOne({ user: parentUserId });
        if (!parent) {
            return res.status(400).json({ error: 'Parent not found. Please create parent first.' });
        }

        const student = await Student.create({
            name,
            email,
            class: studentClass,
            rollNumber,
            parent: parent._id,
            dateOfBirth
        });

        res.status(201).json(student);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Roll number or email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get all students (admin/accountant)
// @route   GET /api/students
// @access  Private (admin, accountant)
// Get all students (with parent details)
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate({
                path: 'parent',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .populate('feeStructure', 'class academicYear totalAmount');

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (admin, accountant, or parent of student)
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate({
                path: 'parent',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .populate('feeStructure', 'class academicYear totalAmount');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Allow access if:
        // - User is admin/accountant, OR
        // - User is the parent of this student
        const isParent = student.parent?.user?._id?.toString() === req.user.id;
        const isAdminOrAccountant = ['admin', 'accountant'].includes(req.user.role);

        if (!isAdminOrAccountant && !isParent) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get students for logged-in parent
// @route   GET /api/students/my
// @access  Private (parent)
const getMyStudents = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user.id });
        if (!parent) {
            return res.status(404).json({ error: 'Parent profile not found' });
        }

        const students = await Student.find({ parent: parent._id })
            .populate('feeStructure', 'class academicYear totalAmount');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get students with submitted fees
// @route   GET /api/students/with-fees
// @access  Private (admin, accountant)
const getStudentsWithFees = async (req, res) => {
    try {
        // Get all payments
        const payments = await Payment.find().lean();

        if (!payments || payments.length === 0) {
            return res.json([]);
        }

        // Get unique student IDs (with null safety)
        const studentIds = [...new Set(
            payments
                .filter(p => p.student) // Filter out null/undefined
                .map(p => p.student.toString())
        )];

        if (studentIds.length === 0) {
            return res.json([]);
        }

        // Get students with their details
        const students = await Student.find({ _id: { $in: studentIds } })
            .populate('parent.user', 'name')
            .populate('feeStructure', 'class academicYear totalAmount')
            .lean();

        // Create student map
        const studentMap = new Map();
        students.forEach(student => {
            if (student && student.feeStructure) {
                studentMap.set(student._id.toString(), {
                    ...student,
                    paymentInfo: {
                        totalPaid: 0,
                        latestPayment: null,
                        paymentCount: 0
                    }
                });
            }
        });

        // Calculate payment info
        payments.forEach(payment => {
            if (!payment.student) return; // Skip invalid payments

            const studentId = payment.student.toString();
            if (studentMap.has(studentId)) {
                const studentData = studentMap.get(studentId);
                studentData.paymentInfo.totalPaid += payment.amountPaid || 0;
                studentData.paymentInfo.paymentCount += 1;

                if (!studentData.paymentInfo.latestPayment ||
                    (payment.paymentDate && payment.paymentDate > studentData.paymentInfo.latestPayment)) {
                    studentData.paymentInfo.latestPayment = payment.paymentDate;
                }
            }
        });

        const result = Array.from(studentMap.values());
        res.json(result);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get students with pending fees
// @route   GET /api/students/pending-fees
// @access  Private (admin, accountant)
const getStudentsWithPendingFees = async (req, res) => {
    try {
        // Get all students with fee structures
        const students = await Student.find({ feeStructure: { $ne: null } })
            .populate('parent.user', 'name email')
            .populate({
                path: 'feeStructure',
                populate: {
                    path: 'feeCategories.category',
                    select: 'name'
                }
            })
            .lean();

        if (students.length === 0) {
            return res.json([]);
        }

        // Get all payments
        const payments = await Payment.find().lean();

        // Create payment map
        const paymentMap = new Map();
        payments.forEach(payment => {
            const studentId = payment.student.toString();
            if (!paymentMap.has(studentId)) {
                paymentMap.set(studentId, {
                    totalPaid: 0,
                    latestPayment: null
                });
            }
            const studentData = paymentMap.get(studentId);
            studentData.totalPaid += payment.amountPaid || 0;
            if (!studentData.latestPayment ||
                payment.paymentDate > studentData.latestPayment) {
                studentData.latestPayment = payment.paymentDate;
            }
        });

        // Filter students with pending fees
        const studentsWithPendingFees = students
            .map(student => {
                const totalAmount = student.feeStructure?.totalAmount || 0;
                const amountPaid = paymentMap.get(student._id.toString())?.totalPaid || 0;
                const balance = totalAmount - amountPaid;

                return {
                    ...student,
                    totalAmount,
                    amountPaid,
                    balance,
                    hasSubmittedPayment: amountPaid > 0,
                    latestPayment: paymentMap.get(student._id.toString())?.latestPayment || null
                };
            })
            .filter(student => student.balance > 0); // Only students with pending fees

        res.json(studentsWithPendingFees);
    } catch (error) {
        console.error('Get students with pending fees error:', error);
        res.status(500).json({ error: 'Failed to fetch students with pending fees' });
    }
};

// @desc    Get student profile for logged-in student
// @route   GET /api/students/profile
// @access  Private (student)
const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.user.email })
            .populate('feeStructure', 'class academicYear totalAmount');

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createStudent,
    updateStudent,
    deleteStudent,
    getAllStudents,
    getStudentById,
    getMyStudents,
    getStudentsWithFees,
    getStudentsWithPendingFees,
    getStudentProfile
};