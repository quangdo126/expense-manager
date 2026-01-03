import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [family, setFamily] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authAPI.me()
                .then(data => {
                    setUser(data.user);
                    setFamily(data.family);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const data = await authAPI.login({ username, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setFamily(data.family);
        return data;
    };

    const register = async (formData) => {
        const data = await authAPI.register(formData);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setFamily(data.family);
        return data;
    };

    const join = async (formData) => {
        const data = await authAPI.join(formData);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setFamily(data.family);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setFamily(null);
    };

    const updateFamily = (newFamily) => {
        setFamily(newFamily);
    };

    const value = {
        user,
        family,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        join,
        logout,
        updateFamily,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
