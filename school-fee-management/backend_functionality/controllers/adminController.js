// backend_functionality/controllers/adminController.js
const User = require('../models/User');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure'); // ✅ Add this import

// Helper functions (same as before)
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const isValidPhone = (phone) => {
    const re = /^\+?[0-9\s\-\(\)]{10,}$/;
    return re.test(phone);
};

const isValidName = (name) => {
    const re = /^[a-zA-Z\s]{2,}$/;
    return re.test(name.trim());
};

const registerParentAndStudent = async (req, res) => {
    try {
        const {
            parentName,
            parentEmail,
            parentPassword,
            parentContact,
            parentAddress,
            studentName,
            studentEmail,
            studentClass,
            rollNumber,
            dateOfBirth
        } = req.body;

        // ===== VALIDATION =====
        const errors = {};

        if (!parentName || !isValidName(parentName)) {
            errors.parentName = 'Parent name must contain only letters and spaces (min 2 characters)';
        }
        if (!parentEmail || !isValidEmail(parentEmail)) {
            errors.parentEmail = 'Valid parent email is required';
        }
        if (!parentPassword || parentPassword.length < 6) {
            errors.parentPassword = 'Password must be at least 6 characters';
        }
        if (!parentContact || !isValidPhone(parentContact)) {
            errors.parentContact = 'Valid contact number is required';
        }
        if (!parentAddress || parentAddress.trim().length < 5) {
            errors.parentAddress = 'Address must be at least 5 characters';
        }
        if (!studentName || !isValidName(studentName)) {
            errors.studentName = 'Student name must contain only letters and spaces (min 2 characters)';
        }
        if (studentEmail && !isValidEmail(studentEmail)) {
            errors.studentEmail = 'Student email must be valid';
        }
        if (!studentClass || studentClass.trim().length < 1) {
            errors.studentClass = 'Class is required';
        }
        if (!rollNumber || rollNumber.trim().length < 2) {
            errors.rollNumber = 'Roll number must be at least 2 characters';
        }

        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            const minDate = new Date('1900-01-01');
            if (isNaN(dob.getTime())) {
                errors.dateOfBirth = 'Invalid date format';
            } else if (dob > today) {
                errors.dateOfBirth = 'Date of birth cannot be in the future';
            } else if (dob < minDate) {
                errors.dateOfBirth = 'Date of birth must be after 1900';
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // ===== CHECK FOR DUPLICATES =====
        const existingParentUser = await User.findOne({ email: parentEmail });
        if (existingParentUser) {
            return res.status(400).json({
                error: 'Parent email already exists',
                details: { parentEmail: 'This email is already registered' }
            });
        }

        if (studentEmail) {
            const existingStudentUser = await User.findOne({ email: studentEmail });
            if (existingStudentUser) {
                return res.status(400).json({
                    error: 'Student email already exists',
                    details: { studentEmail: 'This email is already registered' }
                });
            }
        }

        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({
                error: 'Roll number already exists',
                details: { rollNumber: 'This roll number is already taken' }
            });
        }

        // ===== CREATE RECORDS =====
        const parentUser = await User.create({
            name: parentName.trim(),
            email: parentEmail.toLowerCase().trim(),
            password: parentPassword,
            role: 'parent',
            contact: parentContact.trim()
        });

        const parentProfile = await Parent.create({
            user: parentUser._id,
            contact: parentContact.trim(),
            address: parentAddress.trim()
        });

        const studentData = {
            name: studentName.trim(),
            class: studentClass.trim(),
            rollNumber: rollNumber.trim(),
            parent: parentProfile._id
        };

        if (studentEmail) {
            studentData.email = studentEmail.toLowerCase().trim();
        }
        if (dateOfBirth) {
            studentData.dateOfBirth = new Date(dateOfBirth);
        }

        const student = await Student.create(studentData);

        // ✅ AUTO-ASSIGN FEE STRUCTURE (inside async function)
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        const feeStructure = await FeeStructure.findOne({
            class: studentClass.trim(),
            academicYear: academicYear,
            isActive: true
        });

        if (feeStructure) {
            student.feeStructure = feeStructure._id;
            await student.save();
        }

        res.status(201).json({
            message: 'Parent and student created successfully',
            student: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                class: student.class
            },
            parent: {
                id: parentUser._id,
                name: parentUser.name,
                email: parentUser.email
            }
        });
    } catch (error) {
        console.error('Error in registerParentAndStudent:', error);

        if (error.code === 11000) {
            if (error.message.includes('email')) {
                return res.status(400).json({
                    error: 'Email already exists',
                    details: { parentEmail: 'This email is already registered' }
                });
            }
            if (error.message.includes('rollNumber')) {
                return res.status(400).json({
                    error: 'Roll number already exists',
                    details: { rollNumber: 'This roll number is already taken' }
                });
            }
        }

        res.status(500).json({ error: 'Failed to create parent and student' });
    }
};

module.exports = { registerParentAndStudent };