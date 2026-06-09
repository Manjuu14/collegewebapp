import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminNewsPage from './pages/AdminNewsPage';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { useAuth } from './context/AuthContext';

// ── Redirect to Static Landing Page ─────────────────────────────────────────
const LandingRedirect = () => {
    window.location.href = '/landing.html';
    return null;
};

// ── Loading Spinner shown while token is being validated ─────────────────────
const AuthLoader = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f172a', // Matches index.html early-load style for seamless handoff
        flexDirection: 'column',
        gap: '16px',
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(167,139,250,0.3)',
            borderTopColor: '#a78bfa',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Restoring session...</p>
    </div>
);

// ── Protected Route ───────────────────────────────────────────────────────────
// Waits for auth check to complete before deciding to show or redirect.
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // ① Still verifying token — show spinner, DO NOT redirect yet
    if (loading) return <AuthLoader />;

    // ② No valid session → go to landing/login
    if (!user) return <LandingRedirect />;

    // ③ Wrong role → redirect to root
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LandingRedirect />} />
                <Route path="/"      element={<LandingRedirect />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/news"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminNewsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/coordinator"
                    element={
                        <ProtectedRoute allowedRoles={['coordinator']}>
                            <CoordinatorDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
