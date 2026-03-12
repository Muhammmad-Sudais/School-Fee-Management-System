import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import feeManagementImg from '../images/fee-management.jpg';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [activeRole, setActiveRole] = useState('admin');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(formData.email, formData.password, activeRole);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="vw-100 min-vh-100 d-flex align-items-center justify-content-center" style={styles.masterWrapper}>
            {/* Global Professional Animations */}
            <style>
                {`
                @keyframes meshBackground {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes floatCard {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes reveal {
                    from { opacity: 0; clip-path: inset(0 0 100% 0); }
                    to { opacity: 1; clip-path: inset(0 0 0 0); }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                    animation: reveal 1s cubic-bezier(0.19, 1, 0.22, 1);
                }
                .input-field {
                    transition: all 0.3s ease;
                    border: 2px solid #f1f5f9 !important;
                }
                .input-field:focus {
                    border-color: #3b82f6 !important;
                    background: #fff !important;
                    transform: scale(1.01);
                }
                .btn-animate {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .btn-animate:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
                }
                .btn-animate:active {
                    transform: translateY(0);
                }
                .role-toggle {
                    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                `}
            </style>

            <div className="row g-0 w-100 min-vh-100">
                {/* Visual Side: Mesh Gradient & Image */}
                <div className="col-lg-7 d-none d-lg-block position-relative overflow-hidden">
                    <div style={{
                        ...styles.meshOverlay,
                        background: activeRole === 'admin'
                            ? 'linear-gradient(-45deg, #1e3a8a, #2563eb, #0f172a, #1e40af)'
                            : 'linear-gradient(-45deg, #065f46, #10b981, #064e3b, #059669)',
                        transition: 'all 0.8s ease'
                    }} />
                    <div style={{
                        ...styles.fullBg,
                        backgroundImage: `url(${feeManagementImg})`,
                        mixBlendMode: 'multiply',
                        opacity: 0.6,
                        filter: activeRole === 'admin' ? 'none' : 'hue-rotate(90deg)',
                        transition: 'all 0.8s ease'
                    }} />
                    <div className="h-100 d-flex flex-column justify-content-center p-5 position-relative z-2">
                        <div className={`badge mb-3 py-2 px-3 align-self-start shadow border-0 ${activeRole === 'admin' ? 'bg-primary' : 'bg-success'}`} style={{ borderRadius: '50px' }}>
                            {activeRole === 'admin' ? 'v2.0 Enterprise' : 'Family Connect'}
                        </div>
                        <h1 className="display-2 fw-bold text-white mb-4" style={{ letterSpacing: '-3px', transition: 'all 0.5s ease' }}>
                            {activeRole === 'admin' ? (
                                <>Elevate Your <br /><span style={{ color: '#60a5fa' }}>School Finances.</span></>
                            ) : (
                                <>Empowering <br /><span style={{ color: '#34d399' }}>Education Journeys.</span></>
                            )}
                        </h1>
                        <p className="text-white fs-5 opacity-75" style={{ maxWidth: '500px' }}>
                            {activeRole === 'admin'
                                ? 'Experience the most intuitive fee management interface ever designed for educational excellence.'
                                : 'Access your academic records, fee status, and institution updates in one secure, unified portal.'
                            }
                        </p>
                    </div>
                </div>

                <div className="col-lg-5 col-12 d-flex align-items-center justify-content-center px-4" style={{ background: '#f8fafc' }}>
                    <div className="glass-card w-100 p-4 p-md-5 rounded-4" style={{ maxWidth: '480px' }}>
                        <div className="text-center mb-5">
                            <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{
                                background: activeRole === 'admin' ? '#eef2ff' : '#ecfdf5',
                                color: activeRole === 'admin' ? '#4f46e5' : '#059669'
                            }}>
                                <i className={`bi ${activeRole === 'admin' ? 'bi-shield-lock-fill' : 'bi-people-fill'} fs-2`}></i>
                            </div>
                            <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                                {activeRole === 'admin' ? 'Administration' : 'Family Portal'}
                            </h2>
                            <p className="text-muted">
                                {activeRole === 'admin' ? 'Secure access for staff and officials' : 'Access for students and guardians'}
                            </p>
                        </div>

                        {/* Animated Role Switcher */}
                        <div className="position-relative bg-light p-1 d-flex mb-5" style={{ borderRadius: '15px' }}>
                            <div className="role-toggle shadow-sm" style={{
                                position: 'absolute',
                                width: '50%',
                                height: 'calc(100% - 8px)',
                                background: '#fff',
                                borderRadius: '12px',
                                transform: activeRole === 'admin' ? 'translateX(0)' : 'translateX(96%)',
                                top: '4px',
                                left: '4px'
                            }} />
                            <button
                                className="btn position-relative z-1 flex-grow-1 border-0 fw-bold py-2"
                                style={{
                                    color: activeRole === 'admin' ? '#4f46e5' : '#64748b',
                                    fontSize: '0.9rem'
                                }}
                                onClick={() => setActiveRole('admin')}
                            >
                                <i className="bi bi-person-badge me-2"></i>Admin / Staff
                            </button>
                            <button
                                className="btn position-relative z-1 flex-grow-1 border-0 fw-bold py-2"
                                style={{
                                    color: activeRole === 'parent' ? '#059669' : '#64748b',
                                    fontSize: '0.9rem'
                                }}
                                onClick={() => setActiveRole('parent')}
                            >
                                <i className="bi bi-mortarboard me-2"></i>Students / Parents
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-flex align-items-center mb-4" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <div className="small fw-medium">{error}</div>
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted mb-2 tracking-wider">EMAIL ADDRESS</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-envelope text-muted"></i></span>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="form-control input-field bg-light border-0"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your registered email"
                                        style={{ height: '52px' }}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <label className="form-label small fw-bold text-muted mb-2 tracking-wider">SECURE PASSWORD</label>
                                    <span className="small text-primary fw-bold" style={{ cursor: 'pointer', fontSize: '0.75rem' }}>Forgot?</span>
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-lock text-muted"></i></span>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="form-control input-field bg-light border-0"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        style={{ height: '52px' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-animate w-100 py-3 shadow border-0"
                                style={{
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    background: activeRole === 'admin'
                                        ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#fff'
                                }}
                            >
                                {isSubmitting ? (
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                ) : (
                                    activeRole === 'admin' ? 'Login to Dashboard' : 'Enter Family Portal'
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <p className="text-muted small">
                                Protected by <i className="bi bi-patch-check-fill text-primary"></i> 256-bit SSL
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    masterWrapper: {
        background: '#f8fafc',
        overflow: 'hidden'
    },
    meshOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(-45deg, #1e3a8a, #2563eb, #0f172a, #1e40af)',
        backgroundSize: '400% 400%',
        animation: 'meshBackground 15s ease infinite',
        zIndex: 1
    },
    fullBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1
    }
};