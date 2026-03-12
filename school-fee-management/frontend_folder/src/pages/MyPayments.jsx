// src/pages/MyPayments.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MyPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [studentIds, setStudentIds] = useState([]);

    useEffect(() => {
        const fetchStudentIds = async () => {
            try {
                if (user.role === 'parent') {
                    const res = await axios.get('http://localhost:5000/api/students/my');
                    setStudentIds(res.data.map(s => s._id));
                } else if (user.role === 'student') {
                    const studentRes = await axios.get('http://localhost:5000/api/students/profile');
                    setStudentIds([studentRes.data._id]);
                }
            } catch (err) {
                setError('Unable to load student profiles.');
                setLoading(false);
            }
        };
        fetchStudentIds();
    }, [user]);

    useEffect(() => {
        if (studentIds.length === 0 && !loading) return;
        if (studentIds.length === 0) return;

        const fetchPayments = async () => {
            try {
                const results = await Promise.all(studentIds.map(id =>
                    axios.get(`http://localhost:5000/api/payments/student/${id}`)
                ));
                const all = results.flatMap(res => res.data).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
                setPayments(all);
            } catch (err) {
                setError('Failed to load transaction history.');
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [studentIds]);

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted small">Loading your school ledger...</p>
        </div>
    );

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .payment-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); transition: transform 0.3s; }
                .payment-card:hover { transform: translateY(-5px); }
                .amount-display { font-size: 1.75rem; font-weight: 900; color: #059669; }
                .receipt-badge { background: #f1f5f9; color: #475569; font-family: monospace; padding: 4px 12px; border-radius: 6px; font-weight: bold; }
            `}</style>

            <header className="mb-5 animate-fade-in">
                <h5 className="text-primary fw-bold mb-1 small text-uppercase ls-1">Financial History</h5>
                <h1 className="fw-black text-dark mb-0 display-6">
                    {user.role === 'parent' ? "Family Payments" : "My Fee Ledger"}
                </h1>
                <p className="text-muted">Review all transactions and dues associated with your account.</p>
            </header>

            {error && <div className="alert alert-danger rounded-4 border-0 mb-4">{error}</div>}

            {payments.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-5 p-5 text-center animate-fade-in delay-1">
                    <div className="mb-3 text-muted opacity-25"><i className="bi bi-receipt fs-1"></i></div>
                    <h5 className="text-muted">No payment records found</h5>
                    <p className="text-muted small">If you recently made a payment, it may take a few hours to process.</p>
                </div>
            ) : (
                <div className="row g-4 animate-fade-in delay-1">
                    {payments.map((payment) => (
                        <div key={payment._id} className="col-xl-6">
                            <div className="card border-0 shadow-sm rounded-5 payment-card overflow-hidden h-100">
                                <div className="card-body p-4 p-md-5">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                                <i className="bi bi-person-check-fill fs-4"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0 text-dark">{payment.student?.name}</h5>
                                                <span className="text-muted small">Roll: {payment.student?.rollNumber} • Class {payment.student?.class}</span>
                                            </div>
                                        </div>
                                        <div className="receipt-badge">#{payment.receiptId}</div>
                                    </div>

                                    <div className="row g-4 align-items-center">
                                        <div className="col-md-7">
                                            <div className="text-muted small fw-bold text-uppercase ls-1 mb-1">Amount Collected</div>
                                            <div className="amount-display">Rs {payment.amountPaid.toLocaleString()}</div>
                                            {payment.lateFee > 0 && <div className="text-danger small fw-bold">+ Rs {payment.lateFee} Late Charge</div>}
                                            <div className="badge bg-light text-dark border rounded-pill px-3 py-1 mt-3 text-uppercase small ls-1">
                                                <i className="bi bi-credit-card me-1"></i> {payment.paymentMethod.replace('_', ' ')}
                                            </div>
                                        </div>
                                        <div className="col-md-5 border-start-md ps-md-4">
                                            <div className="mb-3">
                                                <div className="text-muted small fw-bold text-uppercase ls-1 mb-1">Processed On</div>
                                                <div className="fw-bold text-dark">{new Date(payment.paymentDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted small fw-bold text-uppercase ls-1 mb-1">Status</div>
                                                <div className="text-success fw-bold d-flex align-items-center">
                                                    <i className="bi bi-patch-check-fill me-2"></i> Authorized
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {payment.notes && (
                                        <div className="mt-4 p-3 bg-light rounded-4">
                                            <div className="text-muted small fw-bold text-uppercase ls-1 mb-1">Remarks</div>
                                            <div className="text-dark small fst-italic">"{payment.notes}"</div>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center border-top">
                                    <span className="text-muted small">Recorded by {payment.recordedBy?.name || "School Office"}</span>
                                    <button className="btn btn-link btn-sm text-primary fw-bold text-decoration-none p-0">
                                        <i className="bi bi-download me-1"></i> Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <footer className="mt-5 text-center text-muted animate-fade-in delay-2">
                <small className="ls-1 text-uppercase">For payment discrepancies, please contact <a href="/support" className="text-decoration-none fw-bold">School Support</a></small>
            </footer>
        </div>
    );
}