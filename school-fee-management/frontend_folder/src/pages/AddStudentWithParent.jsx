// src/pages/AddStudentWithParent.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddStudentWithParent() {
    const [formData, setFormData] = useState({
        parentName: '',
        parentEmail: '',
        parentPassword: '',
        parentContact: '',
        parentAddress: '',
        studentName: '',
        studentEmail: '',
        studentClass: '',
        rollNumber: '',
        dateOfBirth: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setGeneralError('');
        setSuccess('');
        setLoading(true);

        try {
            await axios.post('http://localhost:5000/api/admin/register-parent-student', formData);
            setSuccess('Registration successful! Redirecting to Parent Directory...');
            setTimeout(() => navigate('/parents'), 2000);
        } catch (err) {
            if (err.response?.data?.details) setFieldErrors(err.response.data.details);
            else setGeneralError(err.response?.data?.error || 'Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <style>{`
                .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.4); }
                .form-control:focus { box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); border-color: #2563eb; }
                .section-badge { width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 8px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
            `}</style>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <header className="mb-5 text-center">
                        <h1 className="fw-black text-dark mb-2 display-6">Student Enrollment</h1>
                        <p className="text-muted">Register a new student and their associated parent account.</p>
                    </header>

                    {success && <div className="alert alert-success rounded-4 border-0 shadow-sm p-3 mb-4 animate-fade-in"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}
                    {generalError && <div className="alert alert-danger rounded-4 border-0 shadow-sm p-3 mb-4 animate-fade-in"><i className="bi bi-exclamation-triangle-fill me-2"></i>{generalError}</div>}

                    <div className="card border-0 shadow-lg rounded-5 glass-card overflow-hidden">
                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit}>
                                {/* PARENT SECTION */}
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="section-badge">1</div>
                                    <h4 className="fw-bold mb-0">Parent Information</h4>
                                </div>

                                <div className="row g-4 mb-5">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Full Name</label>
                                        <input type="text" name="parentName" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.parentName ? 'is-invalid' : ''}`} value={formData.parentName} onChange={handleChange} required />
                                        {fieldErrors.parentName && <div className="invalid-feedback">{fieldErrors.parentName}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Email Address</label>
                                        <input type="email" name="parentEmail" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.parentEmail ? 'is-invalid' : ''}`} value={formData.parentEmail} onChange={handleChange} required />
                                        {fieldErrors.parentEmail && <div className="invalid-feedback">{fieldErrors.parentEmail}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Account Password</label>
                                        <input type="password" name="parentPassword" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.parentPassword ? 'is-invalid' : ''}`} value={formData.parentPassword} onChange={handleChange} minLength="6" required />
                                        {fieldErrors.parentPassword && <div className="invalid-feedback">{fieldErrors.parentPassword}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Phone Number</label>
                                        <input type="text" name="parentContact" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.parentContact ? 'is-invalid' : ''}`} value={formData.parentContact} onChange={handleChange} required />
                                        {fieldErrors.parentContact && <div className="invalid-feedback">{fieldErrors.parentContact}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Residential Address</label>
                                        <textarea name="parentAddress" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.parentAddress ? 'is-invalid' : ''}`} value={formData.parentAddress} onChange={handleChange} rows="2" required></textarea>
                                        {fieldErrors.parentAddress && <div className="invalid-feedback">{fieldErrors.parentAddress}</div>}
                                    </div>
                                </div>

                                {/* STUDENT SECTION */}
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="section-badge bg-success">2</div>
                                    <h4 className="fw-bold mb-0">Student Profile</h4>
                                </div>

                                <div className="row g-4 mb-5">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Student Full Name</label>
                                        <input type="text" name="studentName" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.studentName ? 'is-invalid' : ''}`} value={formData.studentName} onChange={handleChange} required />
                                        {fieldErrors.studentName && <div className="invalid-feedback">{fieldErrors.studentName}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Student Email (Optional)</label>
                                        <input type="email" name="studentEmail" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.studentEmail ? 'is-invalid' : ''}`} value={formData.studentEmail} onChange={handleChange} />
                                        {fieldErrors.studentEmail && <div className="invalid-feedback">{fieldErrors.studentEmail}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Assigned Class</label>
                                        <input type="text" name="studentClass" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.studentClass ? 'is-invalid' : ''}`} value={formData.studentClass} onChange={handleChange} placeholder="e.g., 10th" required />
                                        {fieldErrors.studentClass && <div className="invalid-feedback">{fieldErrors.studentClass}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Roll No</label>
                                        <input type="text" name="rollNumber" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.rollNumber ? 'is-invalid' : ''}`} value={formData.rollNumber} onChange={handleChange} required />
                                        {fieldErrors.rollNumber && <div className="invalid-feedback">{fieldErrors.rollNumber}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase ls-1">Birth Date</label>
                                        <input type="date" name="dateOfBirth" className={`form-control form-control-lg rounded-4 border-light bg-light ${fieldErrors.dateOfBirth ? 'is-invalid' : ''}`} value={formData.dateOfBirth} onChange={handleChange} />
                                        {fieldErrors.dateOfBirth && <div className="invalid-feedback">{fieldErrors.dateOfBirth}</div>}
                                    </div>
                                </div>

                                <div className="d-flex flex-column flex-md-row gap-3 justify-content-end align-items-center">
                                    <button type="button" className="btn btn-light px-5 py-3 rounded-pill fw-bold text-muted border-0 shadow-sm" onClick={() => navigate(-1)}>
                                        Back to Directory
                                    </button>
                                    <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg" disabled={loading}>
                                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</> : 'Complete Enrollment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}