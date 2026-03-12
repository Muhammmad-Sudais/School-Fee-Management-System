// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (!user) return [];
        switch (user.role) {
            case 'admin':
                return [
                    { name: 'Dashboard', path: '/', icon: 'bi-grid-1x2-fill' },
                    { name: 'Directory', path: '/students', icon: 'bi-people-fill' },
                    { name: 'Parents', path: '/parents', icon: 'bi-person-badge-fill' },
                    { name: 'Categories', path: '/fee-categories', icon: 'bi-tags-fill' },
                    { name: 'Structures', path: '/fee-structures', icon: 'bi-layers-fill' },
                    { name: 'Collect Fee', path: '/payments/new', icon: 'bi-wallet-fill' },
                    { name: 'Support', path: '/support', icon: 'bi-question-circle-fill' },
                ];
            case 'accountant':
                return [
                    { name: 'Dashboard', path: '/', icon: 'bi-grid-1x2-fill' },
                    { name: 'Directory', path: '/students', icon: 'bi-people-fill' },
                    { name: 'Parents', path: '/parents', icon: 'bi-person-badge-fill' },
                    { name: 'Collect Fee', path: '/payments/new', icon: 'bi-cash-coin' },
                    { name: 'Overdue', path: '/students/pending-fees', icon: 'bi-clock-history' },
                    { name: 'Support', path: '/support', icon: 'bi-question-circle-fill' },
                ];
            default:
                return [
                    { name: 'Dashboard', path: '/', icon: 'bi-house-fill' },
                    { name: 'My Payments', path: '/my-payments', icon: 'bi-receipt' },
                    { name: 'Support', path: '/support', icon: 'bi-question-circle-fill' },
                ];
        }
    };

    const navItems = getNavItems();

    return (
        <>
            <style>{`
                .glass-navbar {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 0.8rem 0;
                    z-index: 1030;
                }
                .brand-gradient {
                    background: linear-gradient(135deg, #2563eb, #7c3aed);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                .nav-pill-link {
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.9rem;
                    padding: 0.6rem 1rem !important;
                    border-radius: 50px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    margin: 0 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .nav-pill-link:hover {
                    color: #1e293b;
                    background: rgba(241, 245, 249, 0.8);
                    transform: translateY(-1px);
                }
                .nav-pill-link.active {
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                }
                .nav-pill-link.active i {
                    color: rgba(255,255,255,0.9);
                }
                /* Profile & User Badge */
                .user-badge {
                    background: #f1f5f9;
                    padding: 4px 4px 4px 12px;
                    border-radius: 50px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .user-badge:hover {
                    background: #fff;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    border-color: #cbd5e1;
                }
                .avatar-circle {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #4f46e5, #0ea5e9);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                }
                .dropdown-glass {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 20px 40px -5px rgba(0,0,0,0.1);
                    border-radius: 16px;
                    padding: 8px;
                    min-width: 200px;
                    animation: slideDown 0.2s ease-out;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* Mobile Menu Polish */
                .navbar-collapse {
                    background: transparent;
                }
                @media (max-width: 991px) {
                    .navbar-collapse {
                        background: rgba(255, 255, 255, 0.98);
                        border-radius: 16px;
                        padding: 1rem;
                        margin-top: 1rem;
                        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
                        border: 1px solid #f1f5f9;
                    }
                    .nav-pill-link {
                        width: 100%;
                        justify-content: flex-start;
                        margin: 4px 0;
                    }
                }
            `}</style>

            <nav className="navbar navbar-expand-xl fixed-top glass-navbar">
                <div className="container-fluid px-4">
                    {/* Brand */}
                    <Link className="navbar-brand d-flex align-items-center gap-3" to="/">
                        <div className="d-flex align-items-center justify-content-center bg-primary bg-gradient rounded-3 text-white shadow-sm" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-mortarboard-fill fs-5"></i>
                        </div>
                        <div className="d-flex flex-column">
                            <span className="brand-gradient fs-5 lh-1">SchoolFee</span>
                            <small className="text-muted fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>MANAGEMENT</small>
                        </div>
                    </Link>

                    {/* Mobile Toggler */}
                    <button className="navbar-toggler border-0 p-2 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navContainer">
                        <div className="d-flex flex-column gap-1">
                            <div className="bg-dark rounded-1" style={{ width: '24px', height: '2px' }}></div>
                            <div className="bg-dark rounded-1" style={{ width: '24px', height: '2px' }}></div>
                            <div className="bg-dark rounded-1" style={{ width: '24px', height: '2px' }}></div>
                        </div>
                    </button>

                    {/* Navigation Links */}
                    <div className="collapse navbar-collapse" id="navContainer">
                        <ul className="navbar-nav mx-auto my-3 my-xl-0">
                            {navItems.map((item) => (
                                <li className="nav-item" key={item.path}>
                                    <Link
                                        className={`nav-link nav-pill-link ${location.pathname === item.path ? 'active' : ''}`}
                                        to={item.path}
                                    >
                                        <i className={`bi ${item.icon}`}></i>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* User Profile */}
                        {user && (
                            <div className="d-flex align-items-center gap-3">
                                {/* Role Badge (PC Only) */}
                                <div className="d-none d-xl-block">
                                    <span className={`badge rounded-pill border ${user.role === 'admin' ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-success-subtle text-success border-success-subtle'} px-3 py-2 fw-bold`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>

                                <div className="dropdown">
                                    <div
                                        className="user-badge"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <div className="d-none d-sm-block text-end">
                                            <div className="fw-bold text-dark lh-1 small">{user.name}</div>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Logged in</small>
                                        </div>
                                        <div className="avatar-circle shadow-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                    </div>

                                    <ul className="dropdown-menu dropdown-menu-end dropdown-glass border-0 mt-3">
                                        <li>
                                            <div className="px-3 py-2 border-bottom d-xl-none">
                                                <div className="fw-bold text-dark">{user.name}</div>
                                                <div className="small text-muted text-uppercase">{user.role}</div>
                                            </div>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item rounded-3 py-2 my-1 fw-medium" to="/profile">
                                                <i className="bi bi-person-gear me-2 text-primary"></i>
                                                Profile Settings
                                            </Link>
                                        </li>

                                        <li><hr className="dropdown-divider opacity-10 my-1" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item rounded-3 py-2 my-1 fw-medium text-danger d-flex align-items-center"
                                                onClick={handleLogout}
                                            >
                                                <i className="bi bi-box-arrow-right me-2"></i>
                                                Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}