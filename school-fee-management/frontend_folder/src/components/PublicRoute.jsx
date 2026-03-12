// src/components/PublicRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PublicRoute = ({ children }) => {
    const { user } = useAuth()

    if (user) {
        return <Navigate to="/" />
    }

    return children ? children : <Outlet />
}

export default PublicRoute