// src/components/EditFeeStructureModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EditFeeStructureModal({ student, onClose, onEditSuccess }) {
    const [feeCategories, setFeeCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [originalFeeStructure, setOriginalFeeStructure] = useState(null);

    // Initialize fee categories when modal opens
    useEffect(() => {
        if (student && student.feeStructure) {
            // Handle both populated and unpopulated feeCategories
            const categories = [];

            if (Array.isArray(student.feeStructure.feeCategories)) {
                student.feeStructure.feeCategories.forEach(cat => {
                    // Handle populated category (cat.category is object)
                    if (cat.category && typeof cat.category === 'object') {
                        categories.push({
                            category: cat.category._id,
                            categoryName: cat.category.name || 'Unknown Category',
                            amount: cat.amount || 0,
                            originalAmount: cat.amount || 0
                        });
                    }
                    // Handle unpopulated category (cat.category is string ID)
                    else if (typeof cat.category === 'string') {
                        categories.push({
                            category: cat.category,
                            categoryName: 'Category', // Will be populated on backend
                            amount: cat.amount || 0,
                            originalAmount: cat.amount || 0
                        });
                    }
                });
            }

            setFeeCategories(categories);
            setOriginalFeeStructure({
                class: student.feeStructure.class,
                academicYear: student.feeStructure.academicYear,
                totalAmount: student.feeStructure.totalAmount
            });
        } else {
            setError('Student fee structure data is incomplete.');
        }
    }, [student]);

    const handleAmountChange = (index, value) => {
        const newCategories = [...feeCategories];
        const amount = value === '' ? 0 : parseFloat(value);
        newCategories[index].amount = isNaN(amount) ? 0 : amount;
        setFeeCategories(newCategories);
    };

    const calculateTotalAmount = () => {
        return feeCategories.reduce((total, cat) => total + cat.amount, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (feeCategories.length === 0) {
            setError('No fee categories available to edit.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const feeStructureUpdate = {
                class: student.feeStructure.class,
                academicYear: student.feeStructure.academicYear,
                feeCategories: feeCategories.map(cat => ({
                    category: cat.category,
                    amount: cat.amount
                }))
            };

            await axios.put(`http://localhost:5000/api/fee-structures/${student.feeStructure._id}`, feeStructureUpdate);
            onEditSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update fee structure');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = calculateTotalAmount();

    return (
        <>
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Fee Structure for {student?.name}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            ></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <h6>Student Details</h6>
                                        <p><strong>Roll Number:</strong> {student?.rollNumber}</p>
                                        <p><strong>Class:</strong> {student?.class}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6>Current Fee Structure</h6>
                                        <p><strong>Academic Year:</strong> {student?.feeStructure?.academicYear}</p>
                                        <p><strong>Original Total:</strong> Rs {originalFeeStructure?.totalAmount?.toLocaleString() || '0'}</p>
                                        <p><strong>New Total:</strong> Rs {totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                {feeCategories.length > 0 ? (
                                    <>
                                        <h6>Fee Categories</h6>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Current Amount</th>
                                                    <th>Edit Amount</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {feeCategories.map((cat, index) => (
                                                    <tr key={cat.category || index}>
                                                        <td>{cat.categoryName}</td>
                                                        <td>Rs {cat.originalAmount.toLocaleString()}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={cat.amount}
                                                                onChange={(e) => handleAmountChange(index, e.target.value)}
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="alert alert-warning">
                                        No fee categories available for this student.
                                    </div>
                                )}

                                {feeCategories.length > 0 && (
                                    <div className="alert alert-info mt-3">
                                        <strong>Note:</strong> Editing fee amounts will update the total fee structure.
                                        Student's payment history will remain intact, but their balance will be recalculated.
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                {feeCategories.length > 0 && (
                                    <button
                                        type="submit"
                                        className="btn btn-warning"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Fee Structure'
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show"></div>
        </>
    );
}