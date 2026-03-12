// src/pages/PendingFees.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import EditFeeStructureModal from '../components/EditFeeStructureModal';

export default function PendingFees() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');

    // Modals
    const [paymentModalStudent, setPaymentModalStudent] = useState(null);
    const [editFeeModalStudent, setEditFeeModalStudent] = useState(null);

    const fetchPendingFees = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/students/pending-fees');
            setStudents(res.data);
        } catch (err) {
            setError('Failed to load students with pending fees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingFees();
    }, []);

    const classes = [...new Set(students.map(s => s.class))];

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.parent?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesClass = filterClass === 'all' || student.class === filterClass;
        return matchesSearch && matchesClass;
    });

    const totalOutstanding = filteredStudents.reduce((sum, s) => sum + s.balance, 0);

    // Handlers
    const handlePaymentSuccess = () => {
        setPaymentModalStudent(null);
        fetchPendingFees();
    };

    const handleEditFeeSuccess = () => {
        setEditFeeModalStudent(null);
        fetchPendingFees();
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-muted fw-light">Analyzing pending dues...</p>
        </div>
    );

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .glass-header { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
                .search-input:focus { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15); border-color: #ef4444; }
                .table-hover tbody tr:hover { background-color: #fef2f2; transform: scale(1.002); transition: 0.2s; }
                .action-btn { transition: all 0.2s; }
                .action-btn:hover { transform: translateY(-2px); }
            `}</style>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h5 className="text-danger fw-bold mb-1 small text-uppercase">Financial Alerts</h5>
                    <h1 className="fw-black text-dark mb-0 display-6 fw-bold">Pending Dues</h1>
                </div>
                <div className="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-4 fw-bold border border-danger border-opacity-25 d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>Total Outstanding: Rs {totalOutstanding.toLocaleString()}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-2">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-0 ps-3">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent shadow-none search-input"
                                    placeholder="Search student, roll no, or parent..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select border-0 bg-light rounded-pill px-4 fw-medium text-secondary cursor-pointer"
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                            >
                                <option value="all">All Classes</option>
                                {classes.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 text-end text-muted small pe-4">
                            Found <span className="fw-bold text-dark">{filteredStudents.length}</span> records
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
                                <th className="py-3 border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
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
                                    <td className="text-end fw-medium">Rs {student.totalAmount.toLocaleString()}</td>
                                    <td className="text-end text-muted">Rs {student.amountPaid.toLocaleString()}</td>
                                    <td className="text-end fw-bold text-danger">Rs {student.balance.toLocaleString()}</td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-sm btn-primary rounded-pill px-3 me-2 action-btn shadow-sm"
                                            onClick={() => setPaymentModalStudent(student)}
                                        >
                                            Collect
                                        </button>
                                        <button
                                            className="btn btn-sm btn-light text-muted rounded-circle action-btn"
                                            title="Edit Fee"
                                            onClick={() => setEditFeeModalStudent(student)}
                                            style={{ width: 32, height: 32 }}
                                        >
                                            <i className="bi bi-pencil-fill small"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="mb-2"><i className="bi bi-check-circle-fill text-success fs-1 opacity-25"></i></div>
                                        <p className="text-muted mb-0">No pending dues found matching your filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {paymentModalStudent && (
                <PaymentModal
                    student={paymentModalStudent}
                    onClose={() => setPaymentModalStudent(null)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
            {editFeeModalStudent && (
                <EditFeeStructureModal
                    student={editFeeModalStudent}
                    onClose={() => setEditFeeModalStudent(null)}
                    onEditSuccess={handleEditFeeSuccess}
                // Pass backdrop class if your modal component supports it, otherwise generic modal style
                />
            )}
        </div>
    );
}