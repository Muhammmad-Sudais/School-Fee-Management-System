// src/pages/PaymentForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function PaymentForm() {
    const { studentId: initialStudentId } = useParams();
    const [formData, setFormData] = useState({
        studentId: initialStudentId || '',
        feeStructureId: '',
        amountPaid: '',
        paymentMethod: 'cash',
        transactionId: '',
        notes: ''
    });
    const [students, setStudents] = useState([]);
    const [feeStructures, setFeeStructures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentRes, feeRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/students'),
                    axios.get('http://localhost:5000/api/fee-structures')
                ]);
                setStudents(studentRes.data);
                setFeeStructures(feeRes.data);

                // If studentId is in URL, try to pre-select their fee structure
                if (initialStudentId) {
                    const student = studentRes.data.find(s => s._id === initialStudentId);
                    if (student && student.feeStructure) {
                        setFormData(prev => ({ ...prev, feeStructureId: student.feeStructure._id || student.feeStructure }));
                    }
                }
            } catch (err) {
                setSubmitStatus({ type: 'danger', message: 'Initialization failed.' });
            } finally {
                setInitLoading(false);
            }
        };
        fetchData();
    }, [initialStudentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, amountPaid: parseFloat(formData.amountPaid) };
            await axios.post('http://localhost:5000/api/payments', payload);
            setSubmitStatus({ type: 'success', message: 'Payment recorded successfully!' });
            setTimeout(() => navigate('/payments'), 1500);
        } catch (err) {
            setSubmitStatus({ type: 'danger', message: err.response?.data?.error || 'Submission failed.' });
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
    );

    return (
        <div className="container py-5">
            <style>{`
                .payment-glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.4); }
                .method-card { border: 2px solid #f1f5f9; transition: all 0.2s; cursor: pointer; }
                .method-card.active { border-color: #2563eb; background: #eff6ff; }
                .form-control:focus { box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); border-color: #2563eb; }
            `}</style>

            <div className="row justify-content-center">
                <div className="col-lg-7">
                    <div className="d-flex align-items-center gap-3 mb-5">
                        <button className="btn btn-light rounded-circle p-2" onClick={() => navigate(-1)} style={{ width: 40, height: 40 }}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div>
                            <h1 className="fw-black text-dark mb-0 h3">Revenue Collection</h1>
                            <p className="text-muted small mb-0">Record a new fee transaction into the system.</p>
                        </div>
                    </div>

                    {submitStatus.message && (
                        <div className={`alert alert-${submitStatus.type} rounded-4 border-0 shadow-sm p-3 mb-4 animate-fade-in`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <div className="card border-0 shadow-lg rounded-5 payment-glass overflow-hidden">
                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase ls-1">Select Student</label>
                                    <select name="studentId" className="form-select form-select-lg rounded-4 border-light bg-light" value={formData.studentId} onChange={handleChange} required>
                                        <option value="">-- Choose Student --</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} (Roll: {s.rollNumber})</option>)}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase ls-1">Assign Fee Plan</label>
                                    <select name="feeStructureId" className="form-select form-select-lg rounded-4 border-light bg-light" value={formData.feeStructureId} onChange={handleChange} required>
                                        <option value="">-- Select Structure --</option>
                                        {feeStructures.map(fs => <option key={fs._id} value={fs._id}>{fs.class} - {fs.academicYear} (Total: Rs {fs.totalAmount})</option>)}
                                    </select>
                                </div>

                                <div className="row g-4 mb-4">
                                    <div className="col-md-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Amount to Collect (Rs)</label>
                                        <div className="input-group input-group-lg">
                                            <span className="input-group-text bg-light border-light rounded-start-4 text-muted">Rs</span>
                                            <input type="number" name="amountPaid" className="form-control rounded-end-4 border-light bg-light fw-bold" value={formData.amountPaid} onChange={handleChange} required min="1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className="form-label small fw-bold text-muted text-uppercase ls-1">Payment Channel</label>
                                    <div className="row g-3">
                                        {[
                                            { id: 'cash', label: 'Cash', icon: 'bi-cash' },
                                            { id: 'bank_transfer', label: 'Bank', icon: 'bi-bank' },
                                            { id: 'online', label: 'Online', icon: 'bi-globe' }
                                        ].map(m => (
                                            <div className="col-4" key={m.id}>
                                                <div className={`method-card p-3 rounded-4 text-center ${formData.paymentMethod === m.id ? 'active' : ''}`} onClick={() => setFormData({ ...formData, paymentMethod: m.id })}>
                                                    <i className={`bi ${m.icon} fs-4 d-block mb-1`}></i>
                                                    <span className="small fw-bold">{m.label}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {formData.paymentMethod !== 'cash' && (
                                    <div className="mb-4 animate-fade-in">
                                        <div className="p-4 rounded-4 border-2 border-primary border-dashed bg-primary-subtle bg-opacity-10">
                                            <label className="form-label small fw-bold text-primary text-uppercase ls-1 d-flex align-items-center mb-3">
                                                <i className="bi bi-shield-check fs-5 me-2"></i>
                                                Verification Details
                                            </label>
                                            <div className="input-group input-group-lg shadow-sm">
                                                <span className="input-group-text bg-white border-end-0 rounded-start-4 text-muted">
                                                    <i className="bi bi-hash"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    name="transactionId"
                                                    className="form-control border-start-0 rounded-end-4 fw-bold"
                                                    value={formData.transactionId}
                                                    onChange={handleChange}
                                                    placeholder="Bank Ref / Transaction ID"
                                                    required
                                                />
                                            </div>
                                            <p className="text-muted small mt-2 mb-0 px-1">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Please enter the reference number from your bank or online receipt.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {formData.feeStructureId && (
                                    <div className="mb-5 animate-fade-in">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1 mb-3">Plan Breakdown</label>
                                        <div className="bg-light rounded-4 p-4 border border-light-subtle">
                                            {feeStructures.find(fs => fs._id === formData.feeStructureId)?.feeCategories.map((fc, idx) => (
                                                <div key={fc.category?._id || idx} className="d-flex justify-content-between align-items-center mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-white rounded-circle p-2 shadow-sm me-3" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <i className="bi bi-tag-fill text-primary small"></i>
                                                        </div>
                                                        <span className="text-dark fw-bold">{fc.category?.name || 'Category'}</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="text-muted small d-block">Amount Due</span>
                                                        <span className="fw-black text-primary">Rs {fc.amount}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <hr className="my-3 opacity-10" />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-bold text-dark">Total Plan Value</span>
                                                <span className="fs-5 fw-black text-dark">Rs {feeStructures.find(fs => fs._id === formData.feeStructureId)?.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mb-5">
                                    <label className="form-label small fw-bold text-muted text-uppercase ls-1">Remarks (Optional)</label>
                                    <textarea name="notes" className="form-control rounded-4 border-light bg-light" rows="3" value={formData.notes} onChange={handleChange} placeholder="Add any transaction details..."></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" disabled={loading}>
                                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Recording...</> : 'Confirm & Record Payment'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}