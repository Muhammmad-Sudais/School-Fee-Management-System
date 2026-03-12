import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function CreateFeeStructure() {
    const { id } = useParams();
    const isEdit = !!id;
    const [formData, setFormData] = useState({
        class: '',
        academicYear: '',
        feeCategories: []
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchingCategories, setFetchingCategories] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setFetchingCategories(true);
                const catRes = await axios.get('http://localhost:5000/api/fee-categories?isActive=true');
                setCategories(catRes.data);

                if (isEdit) {
                    const structRes = await axios.get(`http://localhost:5000/api/fee-structures/${id}`);
                    const struct = structRes.data;

                    // Map existing categories to form state
                    const feeCategories = catRes.data.map(cat => {
                        const existing = struct.feeCategories.find(fc => (fc.category._id || fc.category) === cat._id);
                        return {
                            category: cat._id,
                            amount: existing ? existing.amount : ''
                        };
                    });

                    setFormData({
                        class: struct.class,
                        academicYear: struct.academicYear,
                        feeCategories
                    });
                } else {
                    const initialFeeCategories = catRes.data.map(cat => ({
                        category: cat._id,
                        amount: ''
                    }));
                    setFormData(prev => ({ ...prev, feeCategories: initialFeeCategories }));
                }
            } catch (err) {
                setError('Failed to load initial data');
                console.error(err);
            } finally {
                setFetchingCategories(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAmountChange = (categoryId, value) => {
        const updatedFeeCategories = formData.feeCategories.map(item =>
            item.category === categoryId ? { ...item, amount: value } : item
        );
        setFormData({ ...formData, feeCategories: updatedFeeCategories });
    };

    const calculateTotal = () => {
        return formData.feeCategories.reduce((total, item) => {
            const amount = parseFloat(item.amount) || 0;
            return total + amount;
        }, 0);
    };

    const validateForm = () => {
        if (!formData.class.trim()) { alert('Class is required'); return false; }
        if (!formData.academicYear.trim()) { alert('Academic year is required'); return false; }
        const yearRegex = /^\d{4}-\d{4}$/;
        if (!yearRegex.test(formData.academicYear)) {
            alert('Academic year must be in format YYYY-YYYY');
            return false;
        }
        const hasValidAmount = formData.feeCategories.some(item => item.amount && parseFloat(item.amount) > 0);
        if (!hasValidAmount) { alert('At least one fee category must have a valid amount'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setError('');
        try {
            const payload = {
                class: formData.class.trim(),
                academicYear: formData.academicYear.trim(),
                feeCategories: formData.feeCategories
                    .filter(item => item.amount && parseFloat(item.amount) > 0)
                    .map(item => ({
                        category: item.category,
                        amount: parseFloat(item.amount)
                    }))
            };

            if (isEdit) {
                await axios.put(`http://localhost:5000/api/fee-structures/${id}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/fee-structures', payload);
            }

            navigate('/fee-structures');
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} fee structure`);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCategories) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status"></div>
                <span className="ms-3 fw-medium text-secondary">Loading configurations...</span>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h1 className="h3 fw-bold text-dark mb-0">{isEdit ? 'Modify Fee Plan' : 'Create Fee Structure'}</h1>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
                                Cancel & Exit
                            </button>
                        </div>

                        {error && (
                            <div className="alert alert-danger border-0 shadow-sm mb-4" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Card 1: Details */}
                            <div className="card border-0 shadow-sm mb-4 rounded-4">
                                <div className="card-body p-4">
                                    <h5 className="mb-4 text-muted small fw-bold text-uppercase border-bottom pb-2">Basic Configuration</h5>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Class / Grade <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control border-2 shadow-none py-2"
                                                name="class"
                                                value={formData.class}
                                                onChange={handleChange}
                                                placeholder="e.g., 10th Standard"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Academic Year <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control border-2 shadow-none py-2"
                                                name="academicYear"
                                                value={formData.academicYear}
                                                onChange={handleChange}
                                                placeholder="e.g., 2024-2025"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Fee Table */}
                            <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="p-4 bg-white border-bottom">
                                        <h5 className="mb-0 text-muted small fw-bold text-uppercase">Fee Categories Breakdown</h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-4 py-3 border-0">Fee Category</th>
                                                    <th className="pe-4 py-3 border-0 text-end" style={{ width: '250px' }}>Amount (Rs)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.feeCategories.map((item) => {
                                                    const category = categories.find(cat => cat._id === item.category);
                                                    return (
                                                        <tr key={item.category}>
                                                            <td className="ps-4 fw-medium text-dark">{category?.name || 'Unknown'}</td>
                                                            <td className="pe-4">
                                                                <div className="input-group input-group-sm shadow-none">
                                                                    <span className="input-group-text bg-white border-end-0">₹</span>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control border-start-0 text-end"
                                                                        value={item.amount}
                                                                        onChange={(e) => handleAmountChange(item.category, e.target.value)}
                                                                        min="0"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Total Footer */}
                                    <div className="p-4 bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
                                        <span className="h6 mb-0 fw-bold text-primary">Total Payable Amount</span>
                                        <div className="text-end">
                                            <span className="h4 mb-0 fw-bold text-primary">
                                                Rs {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="d-flex justify-content-end align-items-center gap-3">
                                <button type="button" className="btn btn-link text-decoration-none text-muted fw-semibold" onClick={() => navigate(-1)}>
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-5 py-2 fw-bold shadow-sm rounded-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>{isEdit ? 'Updating...' : 'Creating...'}</>
                                    ) : (
                                        isEdit ? 'Update Fee Plan' : 'Publish Fee Structure'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}