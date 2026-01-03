import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Join from './pages/Join';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Family from './pages/Family';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Loans from './pages/Loans';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Recurring from './pages/Recurring';

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="auth-page">
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Public Route wrapper (redirect if authenticated)
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="auth-page">
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute><Register /></PublicRoute>
            } />
            <Route path="/join" element={
                <PublicRoute><Join /></PublicRoute>
            } />

            {/* Protected Routes */}
            <Route element={
                <ProtectedRoute><Layout /></ProtectedRoute>
            }>
                <Route index element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="reports" element={<Reports />} />
                <Route path="family" element={<Family />} />
                <Route path="settings" element={<Settings />} />
                <Route path="categories" element={<Categories />} />
                <Route path="loans" element={<Loans />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="goals" element={<Goals />} />
                <Route path="investments" element={<Investments />} />
                <Route path="recurring" element={<Recurring />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

