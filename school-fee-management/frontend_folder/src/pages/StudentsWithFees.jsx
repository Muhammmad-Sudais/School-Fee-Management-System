// src/pages/StudentsWithFees.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentsWithFees() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStudentsWithFees = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/students/with-fees');
                setStudents(res.data);
            } catch (err) {
                setError('Failed to load students with fees');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentsWithFees();
    }, []);

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.parent?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalCollected = filteredStudents.reduce((sum, s) => sum + (s.paymentInfo?.totalPaid || 0), 0);

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-muted fw-light">Loading payment records...</p>
        </div>
    );

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .search-input:focus { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); border-color: #10b981; }
                .table-hover tbody tr:hover { background-color: #ecfdf5; transform: scale(1.002); transition: 0.2s; }
            `}</style>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h5 className="text-success fw-bold mb-1 small text-uppercase">Revenue Insights</h5>
                    <h1 className="fw-black text-dark mb-0 display-6 fw-bold">Compelte Payments</h1>
                </div>
                <div className="bg-success bg-opacity-10 text-success px-4 py-2 rounded-4 fw-bold border border-success border-opacity-25 d-flex align-items-center gap-2">
                    <i className="bi bi-wallet-fill"></i>
                    <span>Collected: Rs {totalCollected.toLocaleString()}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-2">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-0 ps-3">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent shadow-none search-input"
                                    placeholder="Search by student, class, or parent..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-end text-muted small pe-4">
                            Showing <span className="fw-bold text-dark">{filteredStudents.length}</span> students with activity
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table bg-white align-middle mb-0">
                        <thead className="bg-light text-uppercase small text-muted">
                            <tr>
                                <th className="ps-4 py-3 border-0">Student</th>
                                <th className="py-3 border-0">Class</th>
                                <th className="py-3 border-0">Fee Plan</th>
                                <th className="py-3 border-0 text-end">Total</th>
                                <th className="py-3 border-0 text-end">Paid</th>
                                <th className="py-3 border-0 text-end">Balance</th>
                                <th className="py-3 border-0 text-end pe-4">Last Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => {
                                const totalAmount = student.feeStructure?.totalAmount || 0;
                                const amountPaid = student.paymentInfo?.totalPaid || 0;
                                const balance = totalAmount - amountPaid;
                                const lastPayment = student.paymentInfo?.latestPayment
                                    ? new Date(student.paymentInfo.latestPayment).toLocaleDateString()
                                    : 'N/A';

                                return (
                                    <tr key={student._id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark">{student.name}</span>
                                                <span className="small text-muted">Roll: {student.rollNumber}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-light text-dark border">{student.class}</span></td>
                                        <td>
                                            {student.feeStructure ? (
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                                    {student.feeStructure.academicYear}
                                                </span>
                                            ) : <span className="text-muted small">N/A</span>}
                                        </td>
                                        <td className="text-end fw-medium">Rs {totalAmount.toLocaleString()}</td>
                                        <td className="text-end text-success fw-bold">Rs {amountPaid.toLocaleString()}</td>
                                        <td className={`text-end fw-medium ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                                            Rs {balance.toLocaleString()}
                                        </td>
                                        <td className="text-end text-muted pe-4 small">{lastPayment}</td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="mb-2"><i className="bi bi-inbox text-muted fs-1 opacity-25"></i></div>
                                        <p className="text-muted mb-0">No payment records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}