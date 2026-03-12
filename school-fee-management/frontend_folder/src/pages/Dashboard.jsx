// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- SHARED UI COMPONENTS ---

const StatCard = ({ label, value, icon, gradient, delay, link, isCurrency = false }) => {
    const CardWrapper = link ? Link : 'div';
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

    return (
        <div className={`col-12 col-md-6 col-xl-3 animate-fade-in ${delay}`}>
            <CardWrapper to={link} className="text-decoration-none h-100 d-block">
                <div className={`card border-0 h-100 rounded-4 overflow-hidden shadow-sm hover-scale activity-card`}>
                    <div className={`card-body p-4 position-relative`}>
                        {/* Subtle decorative background icon */}
                        <i className={`bi ${icon} position-absolute end-0 bottom-0 display-2 opacity-10 mb-n2 me-n2`}></i>

                        <div className="d-flex align-items-center gap-3 mb-4 position-relative z-1">
                            {/* Improved Icon Box: Square Glass Style */}
                            <div className={`icon-tile bg-gradient-${gradient} rounded-3 d-flex align-items-center justify-content-center shadow-sm`}>
                                <i className={`bi ${icon} fs-4 text-white`}></i>
                            </div>
                            <div className="flex-grow-1">
                                <p className="mb-0 text-muted fw-bold text-uppercase x-small ls-1">{label}</p>
                            </div>
                            {link && <i className="bi bi-chevron-right small text-muted opacity-50"></i>}
                        </div>

                        <div className="position-relative z-1">
                            <h2 className="fw-black text-dark mb-0 h3">
                                {isCurrency && <span className="fs-6 fw-bold me-1 text-muted">Rs</span>}
                                {formattedValue}
                            </h2>
                        </div>

                        {/* Progress line at the bottom for visual flair */}
                        <div className={`position-absolute bottom-0 start-0 h-1 bg-gradient-${gradient}`} style={{ width: '40%' }}></div>
                    </div>
                </div>
            </CardWrapper>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!user) return;
            try {
                const isStaff = user.role === 'admin' || user.role === 'accountant';
                const endpoint = isStaff
                    ? 'http://localhost:5000/api/dashboard/stats'
                    : 'http://localhost:5000/api/dashboard/stats/personal';

                const res = await axios.get(endpoint);
                setStats(res.data);

                if (isStaff) {
                    const payRes = await axios.get('http://localhost:5000/api/payments');
                    setRecentPayments(payRes.data.slice(0, 5));
                }
            } catch (err) {
                setError('Failed to sync data with server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, [user]);

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f4f7fe' }}>
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-muted fw-light ls-1 text-uppercase small">Preparing Dashboard...</p>
        </div>
    );

    if (error) return (
        <div style={{ paddingTop: '120px', backgroundColor: '#f4f7fe', minHeight: '100vh' }}>
            <div className="container">
                <div className="alert alert-danger border-0 shadow rounded-4 p-4 d-flex align-items-center gap-3">
                    <i className="bi bi-cloud-slash-fill fs-2"></i>
                    <div>
                        <h5 className="fw-bold mb-1">Network Error</h5>
                        <p className="mb-0 opacity-75">{error}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!stats || !user) return null;
    const isStaff = user.role === 'admin' || user.role === 'accountant';

    return (
        <div className="dashboard-root" style={{
            backgroundColor: '#f4f7fe',
            minHeight: '100vh',
            paddingTop: '180px',
            paddingBottom: '80px'
        }}>
            <div className="container-fluid px-md-5">
                <style>{`
                    .fw-black { font-weight: 900; }
                    .ls-1 { letter-spacing: 1.5px; }
                    .x-small { font-size: 0.65rem; }
                    .h-1 { height: 3px; }
                    
                    /* Icon Tile Style */
                    .icon-tile { 
                        width: 48px; 
                        height: 48px; 
                        flex-shrink: 0;
                    }

                    /* Backgrounds & Gradients */
                    .bg-gradient-primary { background: linear-gradient(135deg, #4361ee 0%, #4895ef 100%); }
                    .bg-gradient-danger { background: linear-gradient(135deg, #e63946 0%, #ff4d6d 100%); }
                    .bg-gradient-success { background: linear-gradient(135deg, #2a9d8f 0%, #26a69a 100%); }
                    .bg-gradient-info { background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%); }
                    .bg-gradient-dark { background: linear-gradient(135deg, #212529 0%, #343a40 100%); }

                    /* Card Styles */
                    .activity-card {
                        background: #ffffff;
                        border: 1px solid rgba(0,0,0,0.02);
                        transition: all 0.3s ease;
                    }

                    /* Animations */
                    @keyframes fadeInUp { 
                        from { opacity: 0; transform: translateY(30px); } 
                        to { opacity: 1; transform: translateY(0); } 
                    }
                    .animate-fade-in { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .delay-1 { animation-delay: 0.1s; opacity: 0; }
                    .delay-2 { animation-delay: 0.2s; opacity: 0; }
                    .delay-3 { animation-delay: 0.3s; opacity: 0; }
                    .delay-4 { animation-delay: 0.4s; opacity: 0; }

                    .hover-scale:hover { 
                        transform: translateY(-10px); 
                        box-shadow: 0 20px 30px -10px rgba(0,0,0,0.1) !important; 
                    }
                    
                    .action-btn { transition: all 0.3s; border: none; }
                    .action-btn:hover { transform: scale(1.05); }

                    /* Table Styling */
                    .table thead th {
                        font-weight: 700;
                        color: #adb5bd;
                        background-color: #fbfcfd;
                    }
                `}</style>

                {/* HEADER */}
                <header className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 animate-fade-in">
                    <div style={{ paddingTop: '130px' }}>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold small mb-2">
                            WORKSPACE OVERVIEW
                        </span>
                        <h1 className="fw-black text-dark mb-0 display-5 mt-2">
                            {isStaff ? 'Dashboard' : `Hello, ${user.name.split(' ')[0]}`}
                        </h1>
                    </div>
                    <div className="text-md-end">
                        <p className="text-muted small fw-bold mb-0">
                            <i className="bi bi-calendar3 me-2"></i>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </header>

                {/* STATS GRID */}
                <div className="row g-4 mb-5">
                    {isStaff ? (
                        <>
                            <StatCard label="Total Students" value={stats.totalStudents} icon="bi-people" gradient="primary" delay="delay-1" link="/students" />
                            <StatCard label="Parent Directory" value={stats.userCounts?.parent || 0} icon="bi-person-badge-fill" gradient="info" delay="delay-2" link="/parents" />
                            <StatCard label="Dues Pending" value={stats.studentsWithPendingFees} icon="bi-exclamation-circle" gradient="danger" delay="delay-3" link="/students/pending-fees" />
                            <StatCard label="Total Revenue" value={stats.totalCollected} icon="bi-wallet2" gradient="success" delay="delay-4" isCurrency />
                        </>
                    ) : (
                        <>
                            <StatCard label="Total Fees" value={stats.totalFees} icon="bi-layers" gradient="primary" delay="delay-1" isCurrency />
                            <StatCard label="Pending Balance" value={stats.pendingBalance} icon="bi-hourglass" gradient={stats.pendingBalance > 0 ? "danger" : "success"} delay="delay-2" isCurrency />
                            <StatCard label="Paid Amount" value={stats.amountPaid} icon="bi-shield-check" gradient="success" delay="delay-3" isCurrency />
                        </>
                    )}
                </div>

                {/* ACTION CENTER */}
                <div className="card border-0 rounded-4 shadow-lg text-white bg-gradient-dark overflow-hidden animate-fade-in delay-3 mb-5">
                    <div className="card-body p-5 position-relative">
                        <div className="row align-items-center position-relative z-1">
                            <div className="col-lg-6">
                                <h2 className="fw-black mb-2">Quick Actions</h2>
                                <p className="text-white-50">Streamline your school management tasks from one place.</p>
                            </div>
                            <div className="col-lg-6 mt-4 mt-lg-0 text-lg-end">
                                <div className="d-flex flex-wrap gap-3 justify-content-lg-end">
                                    {isStaff ? (
                                        <>
                                            <Link to="/admin/add-student-parent" className="btn btn-primary px-4 py-2 rounded-3 fw-bold action-btn">
                                                Add Enrollment
                                            </Link>
                                            <Link to="/parents" className="btn btn-info px-4 py-2 rounded-3 fw-bold action-btn text-white">
                                                Manage Parents
                                            </Link>
                                            <Link to="/payments/new" className="btn btn-success px-4 py-2 rounded-3 fw-bold action-btn">
                                                Collect Fee
                                            </Link>
                                        </>
                                    ) : (
                                        <Link to="/support" className="btn btn-light px-4 py-2 rounded-3 fw-bold action-btn">
                                            Contact Support
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RECENT ACTIVITY TABLE */}
                {isStaff && recentPayments.length > 0 && (
                    <div className="animate-fade-in delay-4">
                        <h4 className="fw-black text-dark mb-4">Latest Transactions</h4>
                        <div className="card activity-card shadow-sm rounded-4 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th className="ps-4 py-3">STUDENT</th>
                                            <th className="py-3">AMOUNT</th>
                                            <th className="py-3">METHOD</th>
                                            <th className="py-3 text-end pe-4">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPayments.map((pay) => (
                                            <tr key={pay._id}>
                                                <td className="ps-4 py-3">
                                                    <span className="fw-bold text-dark">{pay.student?.name}</span>
                                                    <br />
                                                    <small className="text-muted">{pay.student?.rollNumber}</small>
                                                </td>
                                                <td className="fw-bold text-success">Rs {pay.amountPaid.toLocaleString()}</td>
                                                <td><span className="small fw-medium text-muted">{pay.paymentMethod}</span></td>
                                                <td className="text-end pe-4">
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                                                        <i className="bi bi-patch-check me-1"></i> Paid
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}