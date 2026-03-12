// src/components/DashboardCards.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardCards({ user }) {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalPayments: 0,
        totalAmount: 0,
        pendingPayments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (user.role === 'admin' || user.role === 'accountant') {
                    // Fetch admin stats
                    const [studentRes, paymentRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/students'),
                        axios.get('http://localhost:5000/api/payments')
                    ]);

                    const totalAmount = paymentRes.data.reduce((sum, p) => sum + p.amountPaid + (p.lateFee || 0), 0);

                    setStats({
                        totalStudents: studentRes.data.length,
                        totalPayments: paymentRes.data.length,
                        totalAmount: totalAmount,
                        pendingPayments: 0 // You can enhance this later with due date logic
                    });
                } else if (user.role === 'parent') {
                    // Fetch parent stats
                    const studentRes = await axios.get('http://localhost:5000/api/students/my');
                    let totalAmount = 0;
                    let totalPayments = 0;

                    for (const student of studentRes.data) {
                        const paymentRes = await axios.get(`http://localhost:5000/api/payments/student/${student._id}`);
                        totalPayments += paymentRes.data.length;
                        totalAmount += paymentRes.data.reduce((sum, p) => sum + p.amountPaid + (p.lateFee || 0), 0);
                    }

                    setStats({
                        totalStudents: studentRes.data.length,
                        totalPayments,
                        totalAmount,
                        pendingPayments: 0
                    });
                }
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="row">
                {[1, 2, 3, 4].map(i => (
                    <div className="col-md-3 mb-4" key={i}>
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: user.role === 'parent' ? 'Your Children' : 'Total Students',
            value: stats.totalStudents,
            icon: 'bi-people',
            color: 'primary'
        },
        {
            title: 'Total Payments',
            value: stats.totalPayments,
            icon: 'bi-receipt',
            color: 'success'
        },
        {
            title: 'Total Amount (Rs)',
            value: stats.totalAmount.toLocaleString(),
            icon: 'bi-currency-rupee',
            color: 'warning'
        },
        {
            title: 'Pending Payments',
            value: stats.pendingPayments,
            icon: 'bi-clock-history',
            color: 'danger'
        }
    ];

    return (
        <div className="row">
            {cards.map((card, index) => (
                <div className="col-md-3 mb-4" key={index}>
                    <div className={`card text-white bg-${card.color} border-0 shadow-sm`}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-1">{card.title}</h6>
                                    <h3 className="mb-0">{card.value}</h3>
                                </div>
                                <i className={`bi ${card.icon} fs-2`}></i>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}