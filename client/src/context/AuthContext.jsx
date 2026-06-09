import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true); // true until token is verified

    // ── Restore session ──
    useEffect(() => {
        const restoreSession = async () => {
            const path      = window.location.pathname;
            let   roleMatch = 'student'; // default fallback
            if      (path.startsWith('/admin'))       roleMatch = 'admin';
            else if (path.startsWith('/coordinator')) roleMatch = 'coordinator';

            let token    = localStorage.getItem(`${roleMatch}_token`);
            let userData = localStorage.getItem(`${roleMatch}_user`);

            // --- Migration Bridge: Check for legacy generic keys ---
            if (!token) {
                const legacyToken = localStorage.getItem('token');
                const legacyUser  = localStorage.getItem('user');

                if (legacyToken && legacyUser) {
                    try {
                        const parsedUser = JSON.parse(legacyUser);
                        const role = parsedUser.role || 'student';

                        // Verify this legacy token before migrating
                        const res = await fetch('/api/auth/me', {
                            headers: { Authorization: `Bearer ${legacyToken}` },
                        });

                        if (res.ok) {
                            const freshUser = await res.json();
                            const merged = { ...parsedUser, ...freshUser };
                            
                            // Migrate to new role-specific keys
                            localStorage.setItem(`${role}_token`, legacyToken);
                            localStorage.setItem(`${role}_user`, JSON.stringify(merged));
                            
                            // Clear legacy keys
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');

                            // If role matches current dashboard, proceed
                            if (role === roleMatch) {
                                setUser(merged);
                                setLoading(false);
                                return;
                            }
                            
                            // If role doesn't match dashboard, we just migrated it, 
                            // now let the normal flow check for the correct role_token
                            token    = localStorage.getItem(`${roleMatch}_token`);
                            userData = localStorage.getItem(`${roleMatch}_user`);
                        }
                    } catch (e) {
                        console.error('Legacy migration failed', e);
                    }
                }
            }

            // --- Normal Restoration ---
            if (!token || !userData) {
                // If specific role session not found, check if ANY other role is active
                const roles = ['admin', 'coordinator', 'student'];
                let foundUser = null;
                for (const r of roles) {
                    const u = localStorage.getItem(`${r}_user`);
                    if (u) { foundUser = u; break; }
                }
                
                if (!foundUser) {
                    setLoading(false);
                    return;
                }
                
                // Set user state but let ProtectedRoute handles the redirect if wrong role
                setUser(JSON.parse(foundUser));
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const freshUser = await res.json();
                    const merged    = { ...JSON.parse(userData), ...freshUser };
                    localStorage.setItem(`${roleMatch}_user`, JSON.stringify(merged));
                    setUser(merged);
                } else if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem(`${roleMatch}_token`);
                    localStorage.removeItem(`${roleMatch}_user`);
                    setUser(null);
                } else {
                    setUser(JSON.parse(userData));
                }
            } catch (err) {
                console.warn('Session restoration network error, using cache:', err.message);
                try { setUser(JSON.parse(userData)); } catch { setUser(null); }
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // ── Login ────────────────────────────────────────────────────────────────
    const login = (userData, token) => {
        const normalized = { ...userData, id: userData._id || userData.id };
        const role = normalized.role || 'student';
        
        localStorage.setItem(`${role}_token`, token);
        localStorage.setItem(`${role}_user`, JSON.stringify(normalized));
        setUser(normalized);
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = useCallback((roleParam) => {
        // If no role provided, try to guess from current user state
        const role = roleParam || (user?.role) || 'student';
        
        localStorage.removeItem(`${role}_token`);
        localStorage.removeItem(`${role}_user`);
        
        // Only clear global state if logging out current active role
        if (user?.role === role) {
            setUser(null);
        }

        // Redirect to landing
        window.location.href = '/landing.html';
    }, [user]);

    // ── Update user profile ──────────────────────────────────────────────────
    const updateUser = useCallback((updatedData, newToken) => {
        setUser(prev => {
            if (!prev) return null;
            const role = prev.role || 'student';
            const merged = { ...prev, ...updatedData };
            localStorage.setItem(`${role}_user`, JSON.stringify(merged));
            if (newToken) localStorage.setItem(`${role}_token`, newToken);
            return merged;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {/* Render children only after the session check is done */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
