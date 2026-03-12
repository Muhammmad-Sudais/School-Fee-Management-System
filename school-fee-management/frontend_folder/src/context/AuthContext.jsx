// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // critical: show loading during init

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                try {
                    // Set axios default header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Parse user data
                    const parsedUser = JSON.parse(userData);

                    // Optional: Verify token is still valid by fetching user profile
                    // const res = await axios.get('http://localhost:5000/api/auth/me');
                    // setUser(res.data);

                    // Or just trust localStorage (faster)
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Session validation failed:', error);
                    // Clear invalid session
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password, portal) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password, portal });
            const { token, ...userData } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);

            return userData;
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message || 'Login failed';
            throw new Error(errorMsg);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};