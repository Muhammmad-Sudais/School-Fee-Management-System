// src/pages/FeeStructuresList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function FeeStructuresList() {
    const [feeStructures, setFeeStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const fetchFeeStructures = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/fee-structures');
            setFeeStructures(res.data);
        } catch (err) {
            setError('Failed to load fee structures');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeStructures();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this fee structure? This action cannot be undone.')) return;

        try {
            setDeleting(true);
            await axios.delete(`http://localhost:5000/api/fee-structures/${id}`);
            alert('Fee structure deleted successfully');
            fetchFeeStructures();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to delete fee structure';
            alert(errorMsg);
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 text-muted fw-light">Loading structures...</p>
        </div>
    );

    if (error) return (
        <div className="container mt-5">
            <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i> Error</h5>
                <p className="mb-0">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .hover-scale { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .hover-scale:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
                .structure-card-header {
                    background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .fee-item { transition: background-color 0.2s; }
                .fee-item:hover { background-color: #f8fafc; }
            `}</style>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h5 className="text-primary fw-bold mb-1 small text-uppercase">Financial Configuration</h5>
                    <h1 className="fw-black text-dark mb-0 display-6 fw-bold">Fee Structures</h1>
                </div>
                <Link to="/fee-structures/new" className="btn btn-primary px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm">
                    <i className="bi bi-layers-fill"></i> New Structure
                </Link>
            </div>

            {feeStructures.length === 0 ? (
                <div className="text-center py-5">
                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                        <i className="bi bi-journal-plus fs-1 text-muted opacity-50"></i>
                    </div>
                    <h5 className="text-muted mb-2">No Fee Structures Found</h5>
                    <p className="text-muted small mb-4">Define fees for different classes and academic years.</p>
                    <Link to="/fee-structures/new" className="btn btn-outline-primary rounded-pill">
                        Create First Structure
                    </Link>
                </div>
            ) : (
                <div className="row g-4">
                    {feeStructures.map((fs) => (
                        <div key={fs._id} className="col-md-6 col-lg-4 col-xl-3">
                            <div className="card h-100 border-0 shadow-sm rounded-4 hover-scale overflow-hidden">
                                <div className="structure-card-header p-4 position-relative">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <span className="badge bg-white text-primary border border-primary-subtle rounded-pill mb-2 px-3 py-1">
                                                {fs.academicYear}
                                            </span>
                                            <h3 className="fw-bold mb-0 text-dark">Class {fs.class}</h3>
                                        </div>
                                        <div className="bg-white p-2 rounded-circle shadow-sm text-primary">
                                            <i className="bi bi-bank fs-4"></i>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Total Annual Fee</small>
                                        <div className="fs-3 fw-bold text-dark">Rs {fs.totalAmount.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="p-3 bg-light border-bottom">
                                        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Fee Breakdown</small>
                                    </div>
                                    <div className="list-group list-group-flush">
                                        {fs.feeCategories?.map((item, idx) => (
                                            <div key={idx} className="list-group-item border-0 d-flex justify-content-between align-items-center px-4 py-3 fee-item">
                                                <span className="text-muted fw-medium small">{item.category?.name || 'Unknown Category'}</span>
                                                <span className="fw-bold text-dark small">Rs {item.amount?.toLocaleString() || '0'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-top-0 p-3 d-flex gap-2">
                                    <Link to={`/fee-structures/edit/${fs._id}`} className="btn btn-outline-primary flex-grow-1 rounded-pill fw-bold small">
                                        <i className="bi bi-pencil-square me-1"></i> Edit
                                    </Link>
                                    <button
                                        className="btn btn-outline-danger flex-grow-1 rounded-pill fw-bold small"
                                        onClick={() => handleDelete(fs._id)}
                                        disabled={deleting}
                                    >
                                        <i className="bi bi-trash3-fill me-1"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}