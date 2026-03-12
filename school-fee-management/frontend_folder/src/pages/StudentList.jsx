// src/pages/StudentList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AssignFeeStructureModal from '../components/AssignFeeStructureModal';

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage, setStudentsPerPage] = useState(10);
    const [assignModal, setAssignModal] = useState(null);

    // Edit/Delete state
    const [editStudent, setEditStudent] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', class: '', rollNumber: '' });
    const [deleteStudent, setDeleteStudent] = useState(null);
    const [classes, setClasses] = useState([]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/students');
            setStudents(res.data);
            const uniqueClasses = [...new Set(res.data.map(s => s.class))];
            setClasses(uniqueClasses);
        } catch (err) {
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    // Filter Logic
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // --- HANDLERS ---
    const handleEditClick = (student) => {
        setEditStudent(student);
        setEditForm({
            name: student.name,
            email: student.email || '',
            class: student.class,
            rollNumber: student.rollNumber
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/students/${editStudent._id}`, editForm);
            const updatedStudents = students.map(s =>
                s._id === editStudent._id ? { ...s, ...editForm } : s
            );
            setStudents(updatedStudents);
            setEditStudent(null);
        } catch (err) {
            alert('Failed to update student');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/students/${deleteStudent._id}`);
            const updatedStudents = students.filter(s => s._id !== deleteStudent._id);
            setStudents(updatedStudents);
            setDeleteStudent(null);

            // Adjust pagination if needed
            const newTotalPages = Math.ceil(updatedStudents.length / studentsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (err) {
            alert('Failed to delete student');
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 text-muted fw-light">Syncing records...</p>
        </div>
    );

    return (
        <div className="min-vh-100 bg-light pb-5">
            {/* INJECTED STYLES */}
            <style>{`
                .main-wrapper { padding-top: 40px; }
                .glass-header {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 80px;
                    z-index: 100;
                }
                .student-table thead th {
                    font-weight: 600;
                    color: #64748b;
                    border-bottom: 2px solid #e2e8f0;
                    background-color: #f8fafc;
                }
                .student-table tbody tr { transition: all 0.2s ease; border-bottom: 1px solid #f1f5f9; }
                .student-table tbody tr:hover { 
                    background-color: #fff !important; 
                    transform: scale(1.005);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    z-index: 1;
                    position: relative;
                }
                .action-btn { 
                    width: 32px; 
                    height: 32px; 
                    display: inline-flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 8px; 
                    transition: all 0.2s;
                }
                .action-btn:hover { transform: translateY(-2px); }
                .search-input {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s;
                }
                .search-input:focus {
                    background-color: #fff;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    border-color: #3b82f6;
                }
                .modal-backdrop-blur {
                    backdrop-filter: blur(4px);
                    background-color: rgba(15, 23, 42, 0.4);
                }
            `}</style>

            <div className="main-wrapper">
                {/* Header Section */}
                <div className="container mb-5">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                        <div>
                            <h1 className="h3 fw-bold text-dark mb-1">Student Directory</h1>
                            <p className="text-muted mb-0">Manage enrollments and fee statuses</p>
                        </div>
                        <Link to="/admin/add-student-parent" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
                            <i className="bi bi-person-plus-fill"></i> New Enrollment
                        </Link>
                    </div>
                </div>

                <div className="container">
                    {/* Filters & Controls */}
                    <div className="bg-white p-3 rounded-4 shadow-sm mb-4 border border-light">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-5">
                                <div className="position-relative">
                                    <i className="bi bi-search position-absolute text-muted" style={{ top: '50%', left: '15px', transform: 'translateY(-50%)' }}></i>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg ps-5 fs-6 search-input rounded-pill"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select form-select-lg fs-6 search-input rounded-pill"
                                    value={studentsPerPage}
                                    onChange={(e) => { setStudentsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                >
                                    <option value={10}>Show 10</option>
                                    <option value={25}>Show 25</option>
                                    <option value={50}>Show 50</option>
                                </select>
                            </div>
                            <div className="col-md-4 text-md-end text-muted small">
                                Showing <span className="fw-bold text-dark">{startIndex + 1}-{Math.min(startIndex + studentsPerPage, filteredStudents.length)}</span> of <span className="fw-bold text-dark">{filteredStudents.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-transparent">
                        <div className="table-responsive bg-white">
                            <table className="table student-table align-middle mb-0">
                                <thead className="text-uppercase small">
                                    <tr>
                                        <th className="ps-4 py-3 border-0">Student Info</th>
                                        <th className="py-3 border-0">Class & Roll</th>
                                        <th className="py-3 border-0">Fee Status</th>
                                        <th className="py-3 border-0 text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStudents.map((student) => (
                                        <tr key={student._id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{student.name}</div>
                                                        <div className="small text-muted">{student.email || 'No email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-semibold text-dark">{student.class}</span>
                                                    <span className="small text-muted">Roll: {student.rollNumber}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {student.feeStructure ? (
                                                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-normal border border-success-subtle">
                                                        <i className="bi bi-check-circle-fill me-1"></i> Assigned
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-2 fw-normal border border-warning-subtle">
                                                        <i className="bi bi-exclamation-circle-fill me-1"></i> Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    {!student.feeStructure && (
                                                        <button
                                                            className="action-btn btn btn-light text-warning hover-bg-warning"
                                                            title="Assign Fee Structure"
                                                            onClick={() => setAssignModal(student)}
                                                        >
                                                            <i className="bi bi-currency-dollar"></i>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn btn btn-light text-primary hover-bg-primary"
                                                        title="Edit"
                                                        onClick={() => handleEditClick(student)}
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                    <button
                                                        className="action-btn btn btn-light text-danger hover-bg-danger"
                                                        title="Delete"
                                                        onClick={() => setDeleteStudent(student)}
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">
                                                <div className="mb-2"><i className="bi bi-search fs-1 opacity-25"></i></div>
                                                No students found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="card-footer bg-white border-0 p-3">
                                <div className="d-flex justify-content-center">
                                    <nav>
                                        <ul className="pagination mb-0 gap-2">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link rounded-circle border-0 shadow-sm" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => goToPage(currentPage - 1)}>
                                                    <i className="bi bi-chevron-left small"></i>
                                                </button>
                                            </li>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                    <button
                                                        className={`page-link rounded-circle border-0 shadow-sm ${currentPage === i + 1 ? 'bg-primary text-white' : ''}`}
                                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => goToPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button className="page-link rounded-circle border-0 shadow-sm" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => goToPage(currentPage + 1)}>
                                                    <i className="bi bi-chevron-right small"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Edit Modal */}
            {editStudent && (
                <div className="modal fade show d-block modal-backdrop-blur" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Edit Student</h5>
                                <button type="button" className="btn-close" onClick={() => setEditStudent(null)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body pt-4">
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            id="editName"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditChange}
                                            required
                                            placeholder="Name"
                                        />
                                        <label htmlFor="editName">Full Name</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input
                                            type="email"
                                            className="form-control rounded-3"
                                            id="editEmail"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                            placeholder="Email"
                                        />
                                        <label htmlFor="editEmail">Email Address</label>
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    id="editClass"
                                                    name="class"
                                                    value={editForm.class}
                                                    onChange={handleEditChange}
                                                    required
                                                    placeholder="Class"
                                                />
                                                <label htmlFor="editClass">Class</label>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    id="editRoll"
                                                    name="rollNumber"
                                                    value={editForm.rollNumber}
                                                    onChange={handleEditChange}
                                                    required
                                                    placeholder="Roll No"
                                                />
                                                <label htmlFor="editRoll">Roll Number</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setEditStudent(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteStudent && (
                <div className="modal fade show d-block modal-backdrop-blur" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-body text-center p-4">
                                <div className="mb-3 text-warning">
                                    <i className="bi bi-exclamation-circle-fill display-4"></i>
                                </div>
                                <h5 className="fw-bold mb-2">Delete Student?</h5>
                                <p className="text-muted small mb-4">
                                    Are you sure you want to remove <strong>{deleteStudent.name}</strong>? This action cannot be undone.
                                </p>
                                <div className="d-grid gap-2">
                                    <button type="button" className="btn btn-danger rounded-pill fw-bold" onClick={handleDeleteConfirm}>Yes, Delete</button>
                                    <button type="button" className="btn btn-light rounded-pill fw-bold" onClick={() => setDeleteStudent(null)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {assignModal && (
                <AssignFeeStructureModal
                    studentId={assignModal._id}
                    studentName={assignModal.name}
                    onClose={() => setAssignModal(null)}
                    onAssign={() => { setAssignModal(null); fetchStudents(); }}
                />
            )}
        </div>
    );
}