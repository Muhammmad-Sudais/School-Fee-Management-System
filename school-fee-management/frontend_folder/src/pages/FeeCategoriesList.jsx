// src/pages/FeeCategoriesList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function FeeCategoriesList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const navigate = useNavigate();

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/fee-categories');
            setCategories(res.data);
        } catch (err) {
            setError('Failed to load fee categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = category.isActive;
        else if (statusFilter === 'inactive') matchesStatus = !category.isActive;

        return matchesSearch && matchesStatus;
    });

    // Handle form submission
    const handleSubmit = async (formData) => {
        try {
            if (editingCategory) {
                await axios.put(`http://localhost:5000/api/fee-categories/${editingCategory._id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/fee-categories', formData);
            }
            fetchCategories();
            setShowForm(false);
            setEditingCategory(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Operation failed');
        }
    };

    // Handle toggle status
    const handleToggleStatus = async (category) => {
        const action = category.isActive ? 'deactivate' : 'reactivate';
        if (!window.confirm(`Are you sure you want to ${action} this category?`)) return;

        try {
            await axios.put(`http://localhost:5000/api/fee-categories/${category._id}`, {
                isActive: !category.isActive
            });
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.error || `Failed to ${action} category`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this category? This cannot be undone.')) return;

        try {
            await axios.delete(`http://localhost:5000/api/fee-categories/${id}`);
            alert('Category deleted successfully');
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted fw-light">Loading categories...</p>
        </div>
    );

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .glass-header {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .hover-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                .search-input:focus {
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    border-color: #3b82f6;
                }
                .modal-backdrop-blur {
                    backdrop-filter: blur(5px);
                    background-color: rgba(15, 23, 42, 0.4);
                }
                .status-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
            `}</style>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h5 className="text-primary fw-bold mb-1 small text-uppercase">Financial Configuration</h5>
                    <h1 className="fw-black text-dark mb-0 display-6 fw-bold">Fee Categories</h1>
                </div>
                <button
                    className="btn btn-primary px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => setShowForm(true)}
                >
                    <i className="bi bi-plus-lg"></i> New Category
                </button>
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
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 d-flex justify-content-md-end">
                            <select
                                className="form-select border-0 bg-light w-auto rounded-pill px-4 fw-medium text-secondary cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="row g-4">
                {filteredCategories.map((category) => (
                    <div key={category._id} className="col-md-6 col-lg-4 col-xl-3">
                        <div className={`card h-100 rounded-4 hover-card bg-white ${!category.isActive ? 'opacity-75' : ''}`}>
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${category.isActive ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ width: 40, height: 40 }}>
                                            <i className="bi bi-tag-fill"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold text-dark mb-0">{category.name}</h5>
                                            <span className={`status-badge badge rounded-pill mt-1 ${category.isActive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted small mb-4 flex-grow-1 line-clamp-2">
                                    {category.description || <em className="text-muted opacity-50">No description provided</em>}
                                </p>

                                <div className="d-flex gap-2 pt-3 border-top border-light">
                                    <button
                                        className="btn btn-sm btn-light rounded-pill fw-medium text-primary hover-bg-primary-subtle px-3"
                                        onClick={() => handleEdit(category)}
                                        title="Edit Category"
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className={`btn btn-sm flex-grow-1 rounded-pill fw-medium ${category.isActive
                                            ? 'btn-light text-secondary hover-bg-secondary-subtle'
                                            : 'btn-light text-success hover-bg-success-subtle'
                                            }`}
                                        onClick={() => handleToggleStatus(category)}
                                    >
                                        {category.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-light rounded-pill fw-medium text-danger hover-bg-danger-subtle px-3"
                                        onClick={() => handleDelete(category._id)}
                                        title="Permanently Delete"
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && !loading && (
                <div className="text-center py-5">
                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                        <i className="bi bi-inbox fs-1 text-muted opacity-50"></i>
                    </div>
                    <p className="text-muted">No categories found matching your filters.</p>
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <CategoryForm
                    category={editingCategory}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                    }}
                />
            )}
        </div>
    );
}

function CategoryForm({ category, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert('Name required');
        onSubmit(formData);
    };

    return (
        <div className="modal fade show d-block modal-backdrop-blur" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header border-0 pb-0 pt-4 px-4">
                        <h5 className="modal-title fw-bold">
                            {category ? 'Edit Category' : 'New Category'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onCancel}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    id="catName"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                                <label htmlFor="catName">Category Name</label>
                            </div>
                            <div className="form-floating">
                                <textarea
                                    className="form-control rounded-3"
                                    id="catDesc"
                                    placeholder="Description"
                                    style={{ height: '100px' }}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                                <label htmlFor="catDesc">Description (Optional)</label>
                            </div>
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4">
                            <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                                {category ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}