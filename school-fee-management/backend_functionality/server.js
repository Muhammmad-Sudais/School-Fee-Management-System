// backend_functionality/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// Import routes
const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeStructureRoutes = require('./routes/feeStructureRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feeCategoryRoutes = require('./routes/feeCategoryRoutes');

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fee-categories', feeCategoryRoutes);
app.use('/api/fee-structures', require('./routes/feeStructureRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'School Fee Management Backend is LIVE! 🚀',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err.stack);
    res.status(500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Server running on http://localhost:${PORT}`);
});