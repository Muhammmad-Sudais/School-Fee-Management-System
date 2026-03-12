// backend_functionality/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
    const { name, email, password, role = 'student', contact } = req.body;

    const validRoles = ['admin', 'accountant', 'parent', 'student'];
    if (role && !validRoles.includes(role)) {
        throw new Error('Invalid role');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, role, contact });

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
    });
};

const login = async (req, res) => {
    const { email, password, portal } = req.body;
    console.log(`[LOGIN DEBUG] Attempting login for email: ${email}, portal: ${portal}`);

    // Ensure email is lowercased to match registration
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        console.log(`[LOGIN DEBUG] User not found for email: ${email}`);
        throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        console.log(`[LOGIN DEBUG] Password mismatch for user: ${user.email}`);
        throw new Error('Invalid email or password');
    }

    // Role Validation based on Portal
    if (portal) {
        if (portal === 'admin') {
            const adminRoles = ['admin', 'accountant'];
            if (!adminRoles.includes(user.role)) {
                console.log(`[LOGIN DEBUG] Role mismatch: User ${user.email} (role: ${user.role}) attempted admin portal login`);
                return res.status(403).json({ error: 'This account does not have administrative access. Please use the Family Portal.' });
            }
        } else if (portal === 'parent') {
            const familyRoles = ['parent', 'student'];
            if (!familyRoles.includes(user.role)) {
                console.log(`[LOGIN DEBUG] Role mismatch: User ${user.email} (role: ${user.role}) attempted family portal login`);
                return res.status(403).json({ error: 'This account is an administrative account. Please use the Admin Portal.' });
            }
        }
    }

    console.log(`[LOGIN DEBUG] Login successful for user: ${user.email}`);

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
    });
};

const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new Error('User not found');
    res.json(user);
};

const updateMe = async (req, res) => {
    const { name, email, contact } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        user.contact = contact || user.contact;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            contact: updatedUser.contact
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = { register, login, getMe, updateMe };