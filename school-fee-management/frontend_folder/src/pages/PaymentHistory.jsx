// src/pages/PaymentHistory.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { studentId } = useParams();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const url = studentId
                    ? `http://localhost:5000/api/payments/student/${studentId}`
                    : 'http://localhost:5000/api/payments';

                const res = await axios.get(url);
                setPayments(res.data);
            } catch (err) {
                setError('Failed to load transaction history');
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [studentId]);

    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-muted fw-light">Retrieving ledger details...</p>
        </div>
    );

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .glass-header { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
                .table-hover tbody tr:hover { background-color: #f8fafc; transform: scale(1.001); transition: 0.2s; }
                .status-chip { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
            `}</style>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div className="animate-fade-in">
                    <h5 className="text-primary fw-bold mb-1 small text-uppercase ls-1">Financial Records</h5>
                    <h1 className="fw-black text-dark mb-0 display-6 fw-bold">
                        {studentId ? 'Payment History' : 'Global Transactions'}
                    </h1>
                </div>
                {!studentId && (
                    <div className="bg-white border rounded-4 px-4 py-3 shadow-sm d-flex align-items-center gap-3 animate-fade-in delay-1">
                        <div className="icon-box bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                            <i className="bi bi-cash-stack fs-5"></i>
                        </div>
                        <div>
                            <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Period Total</div>
                            <div className="fw-black fs-5">Rs {totalCollected.toLocaleString()}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden animate-fade-in delay-2">
                <div className="table-responsive">
                    <table className="table bg-white align-middle mb-0">
                        <thead className="bg-light text-uppercase small text-muted ls-1">
                            <tr>
                                <th className="ps-4 py-3 border-0">Entity Details</th>
                                <th className="py-3 border-0">Class</th>
                                <th className="py-3 border-0 text-end">Amount Paid</th>
                                <th className="py-3 border-0 text-end">Balance</th>
                                <th className="py-3 border-0">Channel</th>
                                <th className="py-3 border-0">Processing Date</th>
                                <th className="py-3 border-0 text-end pe-4">Approver</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td className="ps-4 py-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                <i className="bi bi-person-fill small"></i>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark">{payment.student?.name || 'N/A'}</span>
                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{payment.student?.rollNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border">{payment.feeStructure?.class || 'N/A'}</span></td>
                                    <td className="text-end fw-bold text-success">Rs {payment.amountPaid.toLocaleString()}</td>
                                    <td className={`text-end fw-medium ${payment.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                        Rs {payment.balance.toLocaleString()}
                                    </td>
                                    <td>
                                        <span className="badge bg-white border text-dark rounded-pill px-3 py-1 fw-bold status-chip text-uppercase">
                                            {payment.paymentMethod.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="text-muted small">{new Date(payment.paymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td className="text-end pe-4">
                                        <span className="small fw-medium text-dark bg-light px-2 py-1 rounded">
                                            {payment.createdBy?.name || 'System'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="mb-2"><i className="bi bi-search text-muted fs-1 opacity-25"></i></div>
                                        <p className="text-muted mb-0">No transaction records found in the ledger.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 animate-fade-in delay-3">
                <Link to="/" className="btn btn-light rounded-pill px-4 fw-bold text-muted small border-0">
                    <i className="bi bi-arrow-left me-2"></i> Back to Workspace
                </Link>
            </div>
        </div>
    );
}