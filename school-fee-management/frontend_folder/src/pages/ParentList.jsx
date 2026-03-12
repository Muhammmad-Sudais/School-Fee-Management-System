// src/pages/ParentList.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ParentList() {
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editParent, setEditParent] = useState(null);
    const [editForm, setEditForm] = useState({ contact: '', address: '' });
    const [saving, setSaving] = useState(false);


    const fetchParents = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/parents');
            setParents(res.data);
        } catch (err) {
            setError('Failed to load parent accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParents();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this parent account? This will also remove their login access.')) return;

        try {
            await axios.delete(`http://localhost:5000/api/parents/${id}`);
            alert('Parent account deleted successfully');
            fetchParents();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete parent account');
        }
    };

    const filteredParents = parents.filter(parent =>
        parent.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.contact.includes(searchTerm)
    );

    const handleEditClick = (parent) => {
        setEditParent(parent);
        setEditForm({
            contact: parent.contact,
            address: parent.address
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put(`http://localhost:5000/api/parents/${editParent._id}`, editForm);
            setParents(parents.map(p => p._id === editParent._id ? { ...p, ...res.data } : p));
            setEditParent(null);
        } catch (err) {
            alert('Failed to update parent data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-muted fw-light">Loading parent directory...</p>
        </div>
    );

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .search-input:focus { box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); border-color: #4f46e5; }
                .parent-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0,0,0,0.05); }
                .parent-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
                .avatar-placeholder { width: 48px; height: 48px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
            `}</style>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h5 className="text-primary fw-bold mb-1 small text-uppercase">Directory</h5>
                    <h1 className="fw-black text-dark mb-0 display-6 fw-bold">Parent Accounts</h1>
                </div>
                <div className="d-flex gap-2">
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-white border-end-0 rounded-start-pill ps-3">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 rounded-end-pill search-input py-2"
                            placeholder="Search parents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="row g-4">
                {filteredParents.map((parent) => (
                    <div key={parent._id} className="col-md-6 col-lg-4 col-xl-3">
                        <div className="card h-100 rounded-4 parent-card bg-white overflow-hidden">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-5">
                                        {parent.user?.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h5 className="fw-bold text-dark mb-0 text-truncate">{parent.user?.name}</h5>
                                        <p className="text-muted small mb-0 text-truncate">{parent.user?.email}</p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-telephone text-primary small"></i>
                                        <span className="small text-dark fw-medium">{parent.contact}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-geo-alt text-primary small"></i>
                                        <span className="small text-muted text-truncate">{parent.address}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-top mt-auto">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Account Status</span>
                                        <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>Active</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-light btn-sm flex-grow-1 rounded-pill fw-bold text-primary border-0"
                                            onClick={() => handleEditClick(parent)}
                                        >
                                            Edit Details
                                        </button>
                                        <button
                                            className="btn btn-light btn-sm rounded-pill fw-bold text-danger border-0 px-3"
                                            onClick={() => handleDelete(parent._id)}
                                            title="Delete Account"
                                        >
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredParents.length === 0 && !loading && (
                <div className="text-center py-5">
                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                        <i className="bi bi-people fs-1 text-muted opacity-50"></i>
                    </div>
                    <h5 className="text-muted">No parents found</h5>
                    <p className="text-muted small">Try adjusting your search criteria.</p>
                </div>
            )}

            {/* Edit Modal */}
            {editParent && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-primary text-white rounded-top-4 p-4">
                                <h5 className="modal-title fw-bold">Edit Parent Info</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setEditParent(null)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Parent Name</label>
                                        <input type="text" className="form-control bg-light border-0 py-2" value={editParent.user?.name} disabled />
                                        <small className="text-muted">Contact admin to change name or email.</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Contact Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.contact}
                                            onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Residential Address</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={editForm.address}
                                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setEditParent(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
