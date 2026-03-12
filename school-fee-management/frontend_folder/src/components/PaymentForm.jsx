// src/pages/PaymentForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function PaymentForm() {
    const [formData, setFormData] = useState({
        studentId: '',
        paymentMethod: 'cash',
        notes: ''
    });
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentItems, setPaymentItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { studentId } = useParams();

    // Fetch students with fee structures
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/students');
                const studentsWithFeeStructures = res.data.filter(s => s.feeStructure);
                setStudents(studentsWithFeeStructures);

                if (studentId) {
                    const student = studentsWithFeeStructures.find(s => s._id === studentId);
                    if (student) {
                        handleStudentSelect(student);
                    }
                }
            } catch (err) {
                setError('Failed to load students');
            }
        };
        fetchStudents();
    }, [studentId]);

    const handleStudentSelect = async (student) => {
        setSelectedStudent(student);
        setFormData(prev => ({ ...prev, studentId: student._id }));

        // Initialize payment items
        const items = student.feeStructure.feeCategories.map(cat => ({
            feeCategory: cat.category._id,
            categoryName: cat.category.name,
            amountDue: cat.amount,
            amountPaid: 0
        }));
        setPaymentItems(items);
    };

    const handlePaymentAmountChange = (index, value) => {
        const newItems = [...paymentItems];
        const amount = value === '' ? 0 : parseFloat(value);
        newItems[index].amountPaid = isNaN(amount) ? 0 : amount;
        setPaymentItems(newItems);
    };

    const calculateTotalPaid = () => {
        return paymentItems.reduce((total, item) => total + item.amountPaid, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                studentId: formData.studentId,
                paymentItems: paymentItems.map(item => ({
                    feeCategory: item.feeCategory,
                    amountPaid: item.amountPaid
                })),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes
            };

            await axios.post('http://://localhost:5000/api/payments', payload);
            navigate('/payments');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = selectedStudent?.feeStructure?.totalAmount || 0;
    const totalPaid = calculateTotalPaid();
    const balance = totalAmount - totalPaid;

    return (
        <div className="container mt-4">
            <h1 className="h2 mb-4">Record Payment</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Student Selection */}
                        {!studentId && (
                            <div className="mb-4">
                                <label className="form-label">Select Student *</label>
                                <select
                                    className="form-select"
                                    value={formData.studentId}
                                    onChange={(e) => {
                                        const student = students.find(s => s._id === e.target.value);
                                        if (student) handleStudentSelect(student);
                                    }}
                                    required
                                >
                                    <option value="">-- Choose a student --</option>
                                    {students.map(student => (
                                        <option key={student._id} value={student._id}>
                                            {student.name} (Roll: {student.rollNumber}, Class: {student.class})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedStudent && (
                            <>
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h5>Student Details</h5>
                                        <p><strong>Name:</strong> {selectedStudent.name}</p>
                                        <p><strong>Roll Number:</strong> {selectedStudent.rollNumber}</p>
                                        <p><strong>Class:</strong> {selectedStudent.class}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>Fee Structure Summary</h5>
                                        <p><strong>Total Amount:</strong> Rs {totalAmount.toLocaleString()}</p>
                                        <p><strong>Amount Paid:</strong> Rs {totalPaid.toLocaleString()}</p>
                                        <p><strong>Balance:</strong> Rs {balance.toLocaleString()}</p>
                                    </div>
                                </div>

                                <h5 className="mb-3">Payment Breakdown</h5>
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
                                            <tr key={item.feeCategory}>
                                                <td>{item.categoryName}</td>
                                                <td>Rs {item.amountDue.toLocaleString()}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={item.amountPaid}
                                                        onChange={(e) => handlePaymentAmountChange(index, e.target.value)}
                                                        min="0"
                                                        max={item.amountDue}
                                                        step="0.01"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Payment Method *</label>
                                        <select
                                            className="form-select"
                                            value={formData.paymentMethod}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            required
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="credit_card">Credit Card</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Notes</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button
                                type="button"
                                className="btn btn-secondary me-md-2"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !selectedStudent || totalPaid <= 0}
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}