// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        address: '', // for parents
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                // Fetch basic user data
                const userRes = await axios.get('http://localhost:5000/api/auth/me');
                const userData = userRes.data;

                let profileData = {
                    name: userData.name,
                    email: userData.email,
                    contact: userData.contact || '',
                    address: ''
                };

                // If parent, fetch parent-specific data
                if (user.role === 'parent') {
                    try {
                        const parentRes = await axios.get('http://localhost:5000/api/parents/me');
                        profileData.address = parentRes.data.address || '';
                        profileData.contact = parentRes.data.contact || profileData.contact;
                    } catch (err) {
                        console.error('Failed to fetch parent profile extension', err);
                    }
                }

                setFormData(prev => ({ ...prev, ...profileData }));
            } catch (err) {
                setMessage({ type: 'danger', text: 'Failed to load profile data.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            return setMessage({ type: 'danger', text: 'Passwords do not match.' });
        }

        setSaving(true);
        try {
            // Update basic user info
            const userUpdate = {
                name: formData.name,
                email: formData.email,
                contact: formData.contact
            };
            if (formData.password) userUpdate.password = formData.password;

            const userRes = await axios.put('http://localhost:5000/api/auth/me', userUpdate);

            // If parent, update parent-specific info
            if (user.role === 'parent') {
                await axios.put('http://localhost:5000/api/parents/me', {
                    contact: formData.contact,
                    address: formData.address
                });
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Update auth context with new user data
            updateUser(userRes.data);
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f4f7fe' }}>
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container py-5" style={{ marginTop: '80px' }}>
            <div className="row justify-content-center">
                <div className="col-lg-8 col-xl-7">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate-fade-in">
                        <div className="card-header bg-gradient-primary text-white p-4 border-0">
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-circle shadow-sm bg-white text-primary fw-bold fs-3" style={{ width: '64px', height: '64px' }}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="fw-black mb-0">My Profile</h3>
                                    <p className="mb-0 text-white-50 text-uppercase small ls-1 fw-bold">{user.role}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-4 p-md-5 bg-white">
                            {message.text && (
                                <div className={`alert alert-${message.type} border-0 rounded-3 shadow-sm mb-4`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase ls-1">Full Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-person text-primary"></i></span>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control bg-light border-0 py-2 ms-1 rounded-end"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase ls-1">Email Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-envelope text-primary"></i></span>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control bg-light border-0 py-2 ms-1 rounded-end"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase ls-1">Contact Number</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-telephone text-primary"></i></span>
                                        <input
                                            type="text"
                                            name="contact"
                                            className="form-control bg-light border-0 py-2 ms-1 rounded-end"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {user.role === 'parent' && (
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase ls-1">Residential Address</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0"><i className="bi bi-geo-alt text-primary"></i></span>
                                            <input
                                                type="text"
                                                name="address"
                                                className="form-control bg-light border-0 py-2 ms-1 rounded-end"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="col-12 mt-5">
                                    <h5 className="fw-bold mb-3 border-bottom pb-2">Change Password</h5>
                                    <p className="text-muted small mb-4">Leave blank if you don't want to change your password.</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase ls-1">New Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-lock text-primary"></i></span>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control bg-light border-0 py-2 ms-1 rounded-end"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase ls-1">Confirm Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-lock-fill text-primary"></i></span>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="form-control bg-light border-0 py-2 ms-1 rounded-end"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 mt-5 text-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-sm"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving Changes...
                                            </>
                                        ) : (
                                            'Save Profile Settings'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .avatar-circle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #4361ee 0%, #4895ef 100%);
                }
                .ls-1 { letter-spacing: 1px; }
                .fw-black { font-weight: 900; }
                .animate-fade-in {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
