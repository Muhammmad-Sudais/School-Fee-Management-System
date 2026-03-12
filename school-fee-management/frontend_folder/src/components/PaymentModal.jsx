// src/components/PaymentModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaymentModal({ student, onClose, onPaymentSuccess }) {
    const [paymentItems, setPaymentItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize payment items when modal opens
    useEffect(() => {
        if (student && student.feeStructure && student.feeStructure.feeCategories) {
            const items = student.feeStructure.feeCategories.map(cat => ({
                feeCategory: cat.category?._id || cat.category,
                categoryName: cat.category?.name || 'Unknown Category',
                amountDue: cat.amount || 0,
                amountPaid: 0
            }));
            setPaymentItems(items);
        } else {
            setError('Student fee structure data is incomplete. Please refresh the page.');
        }
    }, [student]);

    const handlePaymentAmountChange = (index, value) => {
        const newItems = [...paymentItems];

        // Handle empty input
        if (value === '') {
            newItems[index].amountPaid = 0;
            setPaymentItems(newItems);
            return;
        }

        // Remove any non-numeric characters except decimal point
        let cleanValue = value.replace(/[^\d.]/g, '');

        // Prevent multiple decimal points
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            cleanValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // Convert to number
        const amount = parseFloat(cleanValue);

        if (isNaN(amount)) {
            newItems[index].amountPaid = 0;
        } else {
            // Ensure it's non-negative and doesn't exceed amount due
            newItems[index].amountPaid = Math.max(0, Math.min(amount, newItems[index].amountDue));
        }

        setPaymentItems(newItems);
    };

    const calculateTotalPaid = () => {
        return paymentItems.reduce((total, item) => total + item.amountPaid, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (paymentItems.length === 0) {
            setError('No payment items available. Student may not have a valid fee structure.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                studentId: student._id,
                paymentItems: paymentItems.map(item => ({
                    feeCategory: item.feeCategory,
                    amountPaid: item.amountPaid
                })),
                paymentMethod,
                notes
            };

            await axios.post('http://localhost:5000/api/payments', payload);
            onPaymentSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = student?.feeStructure?.totalAmount || 0;
    const totalPaid = calculateTotalPaid();
    const balance = totalAmount - totalPaid;

    return (
        <>
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Record Payment for {student?.name}</h5>
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
                                        <h6>Fee Summary</h6>
                                        <p><strong>Total Amount:</strong> Rs {totalAmount.toLocaleString()}</p>
                                        <p><strong>Current Balance:</strong> Rs {student?.balance?.toLocaleString() || '0'}</p>
                                    </div>
                                </div>

                                {paymentItems.length > 0 ? (
                                    <>
                                        <h6>Payment Breakdown</h6>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                <tr>
                                                    <th>Fee Category</th>
                                                    <th>Amount Due</th>
                                                    <th>Amount Paid</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {paymentItems.map((item, index) => (
                                                    <tr key={item.feeCategory || index}>
                                                        <td>{item.categoryName}</td>
                                                        <td>Rs {item.amountDue.toLocaleString()}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={item.amountPaid}
                                                                onChange={(e) => handlePaymentAmountChange(index, e.target.value)}
                                                                placeholder="0.00"
                                                                inputMode="decimal"
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

                                {paymentItems.length > 0 && (
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Payment Method</label>
                                            <select
                                                className="form-select"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="credit_card">Credit Card</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Notes</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                {paymentItems.length > 0 && (
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading || totalPaid <= 0}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Recording...
                                            </>
                                        ) : (
                                            'Record Payment'
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