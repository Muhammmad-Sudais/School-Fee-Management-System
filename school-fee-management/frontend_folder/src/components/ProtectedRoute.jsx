// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Show loading spinner instead of redirecting
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;