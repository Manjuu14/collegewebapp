import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Icons (Minimal SVG Set) ──────────────────────────────────────────────────
const Ico = {
    Dashboard: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
    ),
    Events: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    Clubs: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    News: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
    ),
    Settings: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    ),
    Logout: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
    ),
    Plus: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    ),
    Shield: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    ),
    Refresh: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
    )
};

const CoordinatorDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [page, setPage] = useState('dashboard');

    // ── Data State ────────────────────────────────────────────────────────────
    const [myEvents, setMyEvents] = useState([]);
    const [myClubs, setMyClubs] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toast, setToast] = useState(null);

    // ── Form State ────────────────────────────────────────────────────────────
    const [clubForm, setClubForm] = useState({ name: '', description: '', category: 'General', facultyAdvisor: '' });
    const [eventForm, setEventForm] = useState({ title: '', description: '', category: 'General', date: '', venue: '' });
    const [submitting, setSubmitting] = useState(false);
    const hasFetched = useRef(false);
    const [clubImage, setClubImage] = useState(null);
    const [clubImagePreview, setClubImagePreview] = useState(null);
    const [eventImage, setEventImage] = useState(null);
    const [eventImagePreview, setEventImagePreview] = useState(null);

    // ── Profile Settings State ─────────────────────────────────────────────────
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        regNumber: '',
        semester: '',
        section: '',
        course: '',
        password: '',
    });

    // ── Profile Sync Effect ──
    useEffect(() => {
        if (user) {
            setProfileForm(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                regNumber: user.regNumber || '',
                semester: user.semester || '',
                section: user.section || '',
                course: user.course || '',
            }));
            setProfilePicPreview(user.image || null);
        }
    }, [user]);

    const [showPassword, setShowPassword] = useState(false);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileDirty, setProfileDirty] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('coord-theme') === 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('coord-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const updateProfileField = (field, value) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
        setProfileDirty(true);
    };

    const handleProfilePicUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // NEW: Validations
        if (file.size > 2 * 1024 * 1024) {
            showToast('Profile image must be under 2 MB', 'error');
            return;
        }
        if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
            showToast('Only JPG, PNG, WebP allowed', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicPreview(reader.result);
            setProfileDirty(true);
        };
        reader.readAsDataURL(file);
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            const body = { ...profileForm };
            if (profilePicPreview && profilePicPreview !== user?.image) body.image = profilePicPreview;
            if (!body.password) delete body.password;

            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            // Update Auth Context and localStorage
            updateUser(data);
            setProfileForm(prev => ({ ...prev, password: '' }));
            setProfileDirty(false);
            showToast('Profile saved successfully!');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setProfileSaving(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleManualRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        await fetchData(false);
        setTimeout(() => setRefreshing(false), 600); // Visual sustain for rotation
    };

    const fetchData = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const [eventsData, clubsData, newsData] = await Promise.all([
                apiFetch('/api/events/my-events'),
                apiFetch('/api/clubs/my-clubs'),
                apiFetch('/api/announcements'),
            ]);

            setMyEvents(Array.isArray(eventsData) ? eventsData : []);
            setMyClubs(Array.isArray(clubsData) ? clubsData : []);

            if (Array.isArray(clubsData) && clubsData.length > 0 && !eventForm.club) {
                setEventForm(prev => ({ ...prev, club: clubsData[0]._id }));
            }

            setNews(Array.isArray(newsData) ? newsData : []);
        } catch (err) {
            if (isInitial) showToast('Failed to load data', 'error');
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [user, eventForm.club]);

    useEffect(() => {
        if (user && !hasFetched.current) {
            hasFetched.current = true;
            fetchData(true);
        }
    }, [fetchData, user]);

    // ── Silent background polling (15s) ──────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            if (user) fetchData(false);
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchData, user]);

    const handleCreateClub = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', clubForm.name);
            formData.append('description', clubForm.description);
            formData.append('category', clubForm.category);
            formData.append('facultyAdvisor', clubForm.facultyAdvisor);
            if (clubImage) formData.append('image', clubImage);

            const res = await fetch('/api/clubs', {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showToast('Club request submitted for approval!');
            setClubForm({ name: '', description: '', category: 'General', facultyAdvisor: '' });
            setClubImage(null); setClubImagePreview(null);
            fetchData(false);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', eventForm.title);
            formData.append('description', eventForm.description);
            formData.append('category', eventForm.category);
            formData.append('date', eventForm.date);
            formData.append('venue', eventForm.venue);
            // Auto-attach coordinator's first approved club
            const approvedClub = myClubs.find(c => c.status === 'approved');
            if (approvedClub) formData.append('club', approvedClub._id);
            if (eventImage) formData.append('image', eventImage);

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showToast('Event request submitted for approval!');
            setEventForm({ title: '', description: '', category: 'General', date: '', venue: '' });
            setEventImage(null); setEventImagePreview(null);
            fetchData(false);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news?')) return;
        try {
            const res = await fetch(`/api/announcements/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error('Failed to delete');
            showToast('News deleted successfully');
            fetchData(false);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleImageSelect = (file, type) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2 MB', 'error'); return; }
        if (!/\.(jpe?g|png|webp)$/i.test(file.name)) { showToast('Only JPG, PNG, WebP allowed', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            if (type === 'club') { setClubImage(file); setClubImagePreview(e.target.result); }
            else { setEventImage(file); setEventImagePreview(e.target.result); }
        };
        reader.readAsDataURL(file);
    };

    const getImageUrl = (path) => path || null;

    const fallbackGradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];

    // ── Render Utilities ──────────────────────────────────────────────────────
    const StatusBadge = ({ status }) => {
        const labels = { pending: '⏳ Pending', approved: '✓ Approved', rejected: '✕ Rejected' };
        const classes = { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red' };
        return <span className={`coord-badge ${classes[status] || 'badge-blue'}`}>{labels[status] || status}</span>;
    };

    // ── Content Sections ──────────────────────────────────────────────────────

    const renderOverview = () => {
        const pendingCount = [...myEvents, ...myClubs].filter(i => i.status === 'pending').length;
        const totalMembers = myClubs.reduce((acc, c) => acc + (c.members?.length || 0), 0);

        // Mix and sort activities for a unified feed
        const unifiedHubItems = [
            ...myEvents.map(ev => ({ ...ev, hubType: 'event' })),
            ...myClubs.map(c => ({ ...c, hubType: 'club' }))
        ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 8);

        return (
            <div className="coord-content-fade">
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-info">
                            <span className="metric-label">Clubs Managed</span>
                            <span className="metric-val">{myClubs.length}</span>
                        </div>
                        <div className="metric-icon"><Ico.Clubs /></div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-info">
                            <span className="metric-label">Events Created</span>
                            <span className="metric-val">{myEvents.length}</span>
                        </div>
                        <div className="metric-icon"><Ico.Events /></div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-info">
                            <span className="metric-label">Pending Approvals</span>
                            <span className="metric-val">{pendingCount}</span>
                        </div>
                        <div className="metric-icon" style={{ color: '#d97706' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-info">
                            <span className="metric-label">Active Members</span>
                            <span className="metric-val">{totalMembers}</span>
                        </div>
                        <div className="metric-icon" style={{ color: '#059669' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                    </div>
                </div>

                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h2>Overview Hub</h2>
                        <p>Recent activity across all your managed clubs and events.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="text-btn" onClick={() => setPage('events')}>View Events</button>
                        <button className="text-btn" onClick={() => setPage('clubs')}>View Clubs</button>
                    </div>
                </div>

                <div className="card-grid">
                    {unifiedHubItems.map((item, i) => {
                        const isEvent = item.hubType === 'event';
                        const imgUrl = getImageUrl(item.image);
                        return (
                            <div key={item._id} className="pro-card">
                                <div className="pro-card-img">
                                    {imgUrl ? (
                                        <img src={imgUrl} alt={item.title || item.name} className="pro-card-image" loading="lazy" />
                                    ) : (
                                        <div className="pro-card-gradient" style={{ background: fallbackGradients[i % fallbackGradients.length] }} />
                                    )}
                                    <div className="pro-card-overlay">
                                        <span className="cat-badge" style={{ background: isEvent ? '#eef2ff' : '#f0fdf4', color: isEvent ? '#4f46e5' : '#16a34a' }}>
                                            {isEvent ? 'EVENT' : 'CLUB'}
                                        </span>
                                        <StatusBadge status={item.status} />
                                    </div>
                                </div>
                                <div className="pro-card-body">
                                    <h4 className="pro-card-title">{item.title || item.name}</h4>
                                    <p className="pro-card-desc">{item.description}</p>
                                    <div className="pro-card-meta">
                                        {isEvent ? (
                                            <>
                                                <span>📅 {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span>📍 {item.venue}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>👥 {item.members?.length || 0} Members</span>
                                                <span>🏢 {item.category}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {unifiedHubItems.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                            <p>🏛 No activity to show yet. Start by creating a club or event!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderEvents = () => (
        <div className="coord-content-fade">
            <div className="section-header">
                <div>
                    <h2>Event Management</h2>
                    <p>Submit and track event requests for your clubs.</p>
                </div>
            </div>

            <div className="coord-action-layout">
                <div className="coord-form-side">
                    <div className="compact-card">
                        <h3>Create New Event</h3>
                        <form onSubmit={handleCreateEvent} className="compact-form">
                            {/* ... existing form fields ... */}
                            <div className="form-row">
                                <label>Event Title</label>
                                <input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="(Upcoming event)" />
                            </div>
                            <div className="form-row">
                                <label>Description</label>
                                <textarea required rows={3} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} placeholder="What's this event about?" />
                            </div>
                            <div className="form-row">
                                <label>Category</label>
                                <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
                                    <option>Technical</option>
                                    <option>Cultural</option>
                                    <option>Sports</option>
                                    <option>General</option>
                                </select>
                            </div>
                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Date</label>
                                    <input type="date" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <label>Location / Venue</label>
                                    <input required value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} placeholder="Main Hall" />
                                </div>
                            </div>
                            {myClubs.filter(c => c.status === 'approved').length === 0 && <p className="form-hint" style={{ color: '#dc2626' }}>You need an approved club to create events.</p>}
                            <div className="form-row">
                                <label>Event Image (optional)</label>
                                <div className="drop-zone" onClick={() => !eventImagePreview && document.getElementById('event-img-input').click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }} onDragLeave={e => e.currentTarget.classList.remove('drag-over')} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleImageSelect(e.dataTransfer.files[0], 'event'); }}>
                                    {eventImagePreview ? (
                                        <div className="drop-preview-wrap">
                                            <img src={eventImagePreview} alt="preview" className="drop-preview" />
                                            <button type="button" className="drop-remove-btn" onClick={(e) => { e.stopPropagation(); setEventImage(null); setEventImagePreview(null); }} title="Remove image">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="drop-placeholder">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            <span>Click or drag to upload</span>
                                            <span style={{ fontSize: '0.65rem', color: '#c4c8cc' }}>JPG, PNG, WebP · Max 2 MB</span>
                                        </div>
                                    )}
                                    <input id="event-img-input" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => handleImageSelect(e.target.files[0], 'event')} />
                                </div>
                            </div>
                            <button type="submit" className="prime-btn" disabled={submitting || myClubs.filter(c => c.status === 'approved').length === 0}>
                                {submitting ? 'Submitting...' : 'Send for Approval'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="coord-list-side">
                    <div className="section-header" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f3f8' }}>
                        <h2>Submitted Events <span className="list-count" style={{ marginLeft: 8 }}>{myEvents.length}</span></h2>
                    </div>
                    <div className="card-grid">
                        {myEvents.map((ev, i) => {
                            const imgUrl = getImageUrl(ev.image);
                            return (
                                <div key={ev._id} className="pro-card">
                                    <div className="pro-card-img">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={ev.title} className="pro-card-image" loading="lazy" />
                                        ) : (
                                            <div className="pro-card-gradient" style={{ background: fallbackGradients[i % fallbackGradients.length] }} />
                                        )}
                                        <div className="pro-card-overlay"><StatusBadge status={ev.status} /></div>
                                    </div>
                                    <div className="pro-card-body">
                                        <h4 className="pro-card-title">{ev.title}</h4>
                                        <p className="pro-card-desc">{ev.description}</p>
                                        <div className="pro-card-meta">
                                            <span>📅 {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <span>📍 {ev.venue}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {myEvents.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><p>📅 No events submitted yet</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderClubs = () => (
        <div className="coord-content-fade">
            <div className="section-header">
                <div>
                    <h2>Club Requests</h2>
                    <p>Manage existing clubs or request to start a new one.</p>
                </div>
            </div>

            <div className="coord-action-layout">
                <div className="coord-form-side">
                    <div className="compact-card">
                        <h3>Request New Club</h3>
                        <form onSubmit={handleCreateClub} className="compact-form">
                            <div className="form-row">
                                <label>Club Name</label>
                                <input required value={clubForm.name} onChange={e => setClubForm({ ...clubForm, name: e.target.value })} placeholder="e.g. Literary Society" />
                            </div>
                            <div className="form-row">
                                <label>Description</label>
                                <textarea required rows={3} value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} placeholder="Club objective and goals..." />
                            </div>
                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Category</label>
                                    <select value={clubForm.category} onChange={e => setClubForm({ ...clubForm, category: e.target.value })}>
                                        <option>Technical</option>
                                        <option>Cultural</option>
                                        <option>Sports</option>
                                        <option>General</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <label>Faculty Advisor</label>
                                    <input value={clubForm.facultyAdvisor} onChange={e => setClubForm({ ...clubForm, facultyAdvisor: e.target.value })} placeholder="Prof. Name" />
                                </div>
                            </div>
                            <div className="form-row">
                                <label>Club Logo / Image (optional)</label>
                                <div className="drop-zone" onClick={() => !clubImagePreview && document.getElementById('club-img-input').click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }} onDragLeave={e => e.currentTarget.classList.remove('drag-over')} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleImageSelect(e.dataTransfer.files[0], 'club'); }}>
                                    {clubImagePreview ? (
                                        <div className="drop-preview-wrap">
                                            <img src={clubImagePreview} alt="preview" className="drop-preview" />
                                            <button type="button" className="drop-remove-btn" onClick={(e) => { e.stopPropagation(); setClubImage(null); setClubImagePreview(null); }} title="Remove image">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="drop-placeholder">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            <span>Click or drag to upload</span>
                                            <span style={{ fontSize: '0.65rem', color: '#c4c8cc' }}>JPG, PNG, WebP · Max 2 MB</span>
                                        </div>
                                    )}
                                    <input id="club-img-input" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => handleImageSelect(e.target.files[0], 'club')} />
                                </div>
                            </div>
                            <button type="submit" className="prime-btn" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Send for Approval'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="coord-list-side">
                    <div className="section-header" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f3f8' }}>
                        <h2>Managed Clubs <span className="list-count" style={{ marginLeft: 8 }}>{myClubs.length}</span></h2>
                    </div>
                    <div className="card-grid">
                        {myClubs.map((c, i) => {
                            const imgUrl = getImageUrl(c.image);
                            return (
                                <div key={c._id} className="pro-card">
                                    <div className="pro-card-img">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={c.name} className="pro-card-image" loading="lazy" />
                                        ) : (
                                            <div className="pro-card-gradient" style={{ background: fallbackGradients[i % fallbackGradients.length] }} />
                                        )}
                                        <div className="pro-card-overlay">
                                            <span className="cat-badge">{c.category || 'General'}</span>
                                            <StatusBadge status={c.status} />
                                        </div>
                                    </div>
                                    <div className="pro-card-body">
                                        <h4 className="pro-card-title">{c.name}</h4>
                                        <p className="pro-card-desc">{c.description}</p>
                                        <div className="pro-card-meta">
                                            <span>👥 {c.members?.length || 0} Members</span>
                                            {c.facultyAdvisor && <span>🎓 {c.facultyAdvisor}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {myClubs.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><p>🏛 No clubs managed yet</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNews = () => (
        <div className="coord-content-fade">
            <div className="section-header">
                <div>
                    <h2>News & Announcements</h2>
                    <p>Stay updated with the latest college announcements.</p>
                </div>
            </div>
            <div className="news-stack">
                {news.map((item, i) => {
                    const isAnn = !item.type || item.type === 'announcement';
                    return (
                        <div key={item._id} className={`news-card-pro ${isAnn ? 'news-imp' : ''}`}>
                            <div className="news-badge-wrap">
                                <span className={`news-item-badge ${isAnn ? 'badge-red-soft' : 'badge-blue-soft'}`}>
                                    {isAnn ? 'ANNOUNCEMENT' : 'NEWS'}
                                </span>
                            </div>
                            <div className="news-body-wrap">
                                <h3 className="news-h">{item.title}</h3>
                                <p className="news-p">{item.content}</p>
                                <div className="news-footer">
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    {item.postedBy?.name && <span>By {item.postedBy.name}</span>}
                                </div>
                            </div>
                            {(user?.role === 'admin' || user?.role === 'coordinator') && (
                                <button className="news-del-btn" onClick={() => handleDeleteNews(item._id)} title="Delete News">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    );
                })}
                {news.length === 0 && <p className="empty-state">No news posted yet.</p>}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="coord-content-fade">
            <div className="settings-compact-wrap">
                <div className="section-header settings-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <h2>My Data</h2>
                </div>
                <div className="settings-compact-card">
                    {/* ── Profile Picture ── */}
                    <div className="profile-upload-section">
                        <div className="profile-img-container">
                            {profilePicPreview ? (
                                <img src={profilePicPreview} alt="Profile" className="profile-preview-img" />
                            ) : (
                                <div className="profile-initials">{user?.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'CC'}</div>
                            )}
                            <label htmlFor="coord-profile-upload" className="profile-upload-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            </label>
                            <input type="file" id="coord-profile-upload" accept="image/*" hidden onChange={handleProfilePicUpload} />
                        </div>
                        <p className="upload-hint-text">Click to upload picture</p>
                    </div>

                    {/* ── Profile Form ── */}
                    <form onSubmit={handleProfileSave} className="profile-form-grid">
                        {/* Name & Register No */}
                        <div className="pf-group">
                            <label>Coordinator Name</label>
                            <div className="pf-input-wrap">
                                <input type="text" value={profileForm.name} onChange={e => updateProfileField('name', e.target.value)} placeholder="Full Name" required />
                                {profileForm.name && <span className="pf-check">✓</span>}
                            </div>
                        </div>
                        <div className="pf-group">
                            <label>Register Number (e.g. 23A12345)</label>
                            <div className="pf-input-wrap">
                                <input type="text" value={profileForm.regNumber} onChange={e => updateProfileField('regNumber', e.target.value)} placeholder="23A12345" maxLength={8} />
                                {profileForm.regNumber && <span className="pf-check">✓</span>}
                            </div>
                        </div>

                        {/* Semester & Section */}
                        <div className="pf-group pf-half">
                            <label>Semester</label>
                            <div className="pf-select-wrap">
                                <select value={profileForm.semester} onChange={e => updateProfileField('semester', e.target.value)}>
                                    <option value="">Select</option>
                                    {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="pf-group pf-half">
                            <label>Section</label>
                            <div className="pf-select-wrap">
                                <select value={profileForm.section} onChange={e => updateProfileField('section', e.target.value)}>
                                    <option value="">Select</option>
                                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Course */}
                        <div className="pf-group pf-half">
                            <label>Course</label>
                            <div className="pf-select-wrap">
                                <select value={profileForm.course} onChange={e => updateProfileField('course', e.target.value)}>
                                    <option value="">Select</option>
                                    {['BCOM', 'BBA', 'BCA', 'MBA', 'MCA'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="pf-group pf-full">
                            <label>Email Address</label>
                            <div className="pf-input-wrap">
                                <input type="email" value={profileForm.email} onChange={e => updateProfileField('email', e.target.value)} required />
                                {profileForm.email && <span className="pf-check">✓</span>}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="pf-group pf-full">
                            <label>Password</label>
                            <div className="pf-input-wrap pf-password-wrap">
                                <input type={showPassword ? 'text' : 'password'} value={profileForm.password} onChange={e => updateProfileField('password', e.target.value)} placeholder="Update password" />
                                <button type="button" className="pf-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {showPassword ? (
                                            <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                        ) : (
                                            <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                        )}
                                    </svg>
                                </button>
                            </div>
                            <span className="pf-hint">Leave blank to keep current password</span>
                        </div>

                        <div className="pf-divider" />

                        <div className="pf-actions pf-full">
                            <button type="submit" className="pf-save-btn" disabled={!profileDirty || profileSaving}>
                                {profileSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Theme Preference */}
                <div className="settings-compact-card" style={{ marginTop: '24px' }}>
                    <h3 className="settings-section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                        Theme Preference
                    </h3>
                    <p className="settings-section-desc">Choose how the dashboard looks to you.</p>
                    <div className="theme-toggle-grid">
                        <button
                            type="button"
                            className={`theme-pill ${!darkMode ? 'active' : ''}`}
                            onClick={() => setDarkMode(false)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                            Light
                        </button>
                        <button
                            type="button"
                            className={`theme-pill ${darkMode ? 'active' : ''}`}
                            onClick={() => setDarkMode(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            Dark
                        </button>
                    </div>
                </div>

                {/* Account / Sign Out */}
                <div className="account-card">
                    <h3 className="account-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        Account
                    </h3>
                    <p className="account-desc">Signing out will end your current session.</p>
                    <button className="sign-out-btn" onClick={() => logout('coordinator')}>
                        <Ico.Logout />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="coord-container">
            {toast && <div className={`coord-global-toast ripple ${toast.type}`}>{toast.msg}</div>}

            {/* ── Sidebar ── */}
            <aside className="coord-sidebar">
                <div className="sb-top">
                    <div className="sb-logo-wrap">
                        <Ico.Shield />
                        <span className="sb-logo-text">Collexa</span>
                    </div>
                    <nav className="sb-nav-list">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: <Ico.Dashboard /> },
                            { id: 'events', label: 'Events', icon: <Ico.Events /> },
                            { id: 'clubs', label: 'Clubs', icon: <Ico.Clubs /> },
                            { id: 'news', label: 'News', icon: <Ico.News /> },
                            { id: 'settings', label: 'Settings', icon: <Ico.Settings /> },
                        ].map(item => (
                            <button
                                key={item.id}
                                className={`sb-nav-link ${page === item.id ? 'active' : ''}`}
                                onClick={() => setPage(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="sb-bottom">
                    <div className="sb-user-info">
                        <div className="sb-avatar-small">{user?.name?.charAt(0).toUpperCase() || 'C'}</div>
                        <div className="sb-user-details">
                            <span className="sb-user-name">{user?.name || 'Coordinator'}</span>
                            <span className="sb-user-role">Coordinator</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="coord-view">
                <header className="coord-view-header">
                    <div className="page-meta">
                        <h1 className="page-header-title">Club Coordinator Dashboard</h1>
                        <p className="page-header-subtitle">Management Portal &bull; {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className={`btn-refresh-coord ${refreshing ? 'rotating' : ''}`} 
                            onClick={handleManualRefresh}
                            title="Fetch live updates"
                        >
                            <Ico.Refresh />
                            <span>Refresh</span>
                        </button>
                    </div>
                </header>

                <section className="coord-scroll-area">
                    {loading ? (
                        <div className="coord-loader-wrap">
                            <div className="coord-spinner"></div>
                            <p>Syncing data...</p>
                        </div>
                    ) : (
                        <>
                            {page === 'dashboard' && renderOverview()}
                            {page === 'events' && renderEvents()}
                            {page === 'clubs' && renderClubs()}
                            {page === 'news' && renderNews()}
                            {page === 'settings' && renderSettings()}
                        </>
                    )}
                </section>
            </div>

            {/* In-page styles for the new layout overrides */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                * { box-sizing: border-box; }

                .coord-container {
                    display: flex;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%);
                    color: #e2e8f0;
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 14px;
                    -webkit-font-smoothing: antialiased;
                }

                /* ── Sidebar — matches Admin panel exactly ── */
                .coord-sidebar { width: 240px; background: rgba(15,23,42,0.4); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); color: #94a3b8; display: flex; flex-direction: column; justify-content: space-between; position: fixed; top: 0; left: 0; bottom: 0; z-index: 200; border-right: 1px solid rgba(255,255,255,0.08); overflow: hidden; box-shadow: 10px 0 30px rgba(0,0,0,0.2); }
                .sb-top { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
                .sb-logo-wrap { display: flex; align-items: center; gap: 12px; height: 64px; padding: 0 20px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
                .sb-logo-wrap svg { width: 22px; height: 22px; color: #3b82f6; filter: drop-shadow(0 0 8px rgba(59,130,246,0.5)); }
                .sb-logo-text { font-weight: 700; font-size: 0.9rem; letter-spacing: -0.01em; color: #f3f4f6; }
                .sb-nav-list { padding: 12px 8px; display: flex; flex-direction: column; gap: 1px; flex: 1; overflow-y: auto; }
                .sb-nav-link { display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 12px; margin: 2px 0; border: none; background: none; color: #94a3b8; width: 100%; border-radius: 8px; font-weight: 500; font-size: 0.875rem; transition: all 0.25s cubic-bezier(.4,0,.2,1); text-align: left; cursor: pointer; position: relative; white-space: nowrap; will-change: transform; }
                .sb-nav-link svg { width: 16px; height: 16px; flex-shrink: 0; }
                .sb-nav-link:hover { background: rgba(255,255,255,0.05); color: #fff; transform: translateX(6px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .sb-nav-link.active { background: rgba(59,130,246,0.15); color: #3b82f6; font-weight: 700; border: 1px solid rgba(59,130,246,0.3); box-shadow: 0 0 20px rgba(59,130,246,0.2), inset 0 0 10px rgba(59,130,246,0.1); }
                .sb-nav-link.active::before { content: ''; position: absolute; left: -2px; top: 20%; bottom: 20%; width: 4px; background: #3b82f6; border-radius: 0 4px 4px 0; box-shadow: 0 0 15px #3b82f6; }

                .sb-bottom { flex-shrink: 0; }
                .sb-user-info { display: flex; align-items: center; gap: 10px; padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.2); }
                .sb-avatar-small { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: 2px solid rgba(255,255,255,0.1); color: #fff; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 10px rgba(59,130,246,0.3); }
                .sb-user-details { display: flex; flex-direction: column; flex: 1; min-width: 0; }
                .sb-user-name { font-size: 0.85rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.2px; }
                .sb-user-role { font-size: 0.72rem; color: #94a3b8; line-height: 1.4; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

                /* ── Main view ── */
                .coord-view { margin-left: 240px; flex: 1; min-width: 0; width: calc(100% - 240px); display: flex; flex-direction: column; height: 100vh; overflow-y: auto; background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); scroll-behavior: smooth; }
                .coord-view::-webkit-scrollbar { width: 6px; }
                .coord-view::-webkit-scrollbar-track { background: transparent; }
                .coord-view::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .coord-view::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.4); }
                .coord-view-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; background: rgba(15,23,42,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 100; flex-shrink: 0; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
                .page-meta { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; text-align: left; }
                .page-header-title { font-size: 1.3rem; font-weight: 800; color: #f8fafc; margin: 0; letter-spacing: -0.02em; line-height: 1; }
                .page-header-subtitle { font-size: 0.72rem; color: #94a3b8; margin: 0; font-weight: 500; opacity: 0.8; }

                .header-actions { display: flex; align-items: center; gap: 12px; }
                .btn-refresh-coord { display: flex; align-items: center; gap: 8px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93c5fd; padding: 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
                .btn-refresh-coord:hover { background: rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.4); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.2); }
                .btn-refresh-coord svg { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
                .btn-refresh-coord.rotating svg { animation: spinRefresh 0.8s linear infinite; }
                @keyframes spinRefresh { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .coord-scroll-area { flex: 1; width: 100%; padding: 28px 36px 64px; display: flex; flex-direction: column; }
                .coord-content-fade { width: 100%; animation: fadeIn 0.2s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

                /* ── Metrics — Admin-matched stat cards ── */
                .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
                .metric-card { background: rgba(255,255,255,0.03); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275); position: relative; overflow: hidden; will-change: transform; }
                .metric-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 100%; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%); pointer-events: none; }
                .metric-card:hover { transform: translateY(-8px) scale(1.02); background: rgba(255,255,255,0.05); border-color: rgba(59,130,246,0.4); box-shadow: 0 12px 30px rgba(0,0,0,0.3), 0 0 15px rgba(59,130,246,0.2); }
                .metric-label { display: block; font-size: 0.68rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
                .metric-val { font-size: 2rem; font-weight: 800; color: #f8fafc; letter-spacing: -0.04em; line-height: 1.1; }
                .metric-icon { background: rgba(59,130,246,0.15); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); box-shadow: 0 0 16px rgba(59,130,246,0.15); }

                /* ── Split (Recent Events / Clubs) ── */
                .coord-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .coord-split-col { background: rgba(255,255,255,0.04); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
                .split-header { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
                .split-header h3 { font-size: 0.82rem; font-weight: 700; margin: 0; color: #f1f5f9; }
                .text-btn { background: none; border: none; color: #3b82f6; font-size: 0.72rem; font-weight: 600; cursor: pointer; padding: 3px 8px; border-radius: 5px; transition: background 0.18s; }
                .text-btn:hover { background: rgba(59,130,246,0.1); }
                .split-list { padding: 8px; }
                .split-item { display: flex; justify-content: space-between; align-items: center; padding: 11px 12px; border-radius: 7px; transition: 0.18s; }
                .split-item:hover { background: rgba(255,255,255,0.04); }
                .item-details { flex: 1; min-width: 0; }
                .item-main { font-size: 0.81rem; font-weight: 600; color: #f1f5f9; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .item-sub { font-size: 0.69rem; color: #94a3b8; margin: 2px 0 0; }
                .empty-hint { padding: 24px; text-align: center; color: #64748b; font-size: 0.82rem; }

                /* ── Badges ── */
                .badge-green { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
                .badge-amber { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
                .badge-red { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
                .coord-badge { font-size: 0.63rem; font-weight: 700; padding: 3px 9px; border-radius: 99px; white-space: nowrap; letter-spacing: 0.04em; }

                /* ── Action layout: side-by-side grid, full width ── */
                .coord-action-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 28px; width: 100%; align-items: start; }
                .coord-form-side { width: 100%; }
                .coord-list-side { width: 100%; }
                .compact-card { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(16px); box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05); }
                .compact-card h3 { font-size: 1.05rem; font-weight: 800; margin: 0 0 20px; color: #f1f5f9; letter-spacing: -0.01em; }
                .compact-form { display: flex; flex-direction: column; gap: 14px; }
                .form-row { display: flex; flex-direction: column; gap: 6px; }
                .form-row label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em; }
                .compact-form input, .compact-form select, .compact-form textarea { padding: 10px 13px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 0.875rem; color: #e2e8f0; background: rgba(255,255,255,0.05); transition: all 0.2s; font-family: inherit; }
                .compact-form input::placeholder, .compact-form textarea::placeholder { color: #475569; }
                .compact-form input:focus, .compact-form select:focus, .compact-form textarea:focus { outline: none; border-color: rgba(59,130,246,0.6); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); background: rgba(255,255,255,0.08); }
                .compact-form select option { background: #0f172a; color: #e2e8f0; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .form-hint { font-size: 0.75rem; margin: 4px 0 0; }
                .prime-btn { background: linear-gradient(135deg, #6366f1, #4338ca); color: #fff; border: none; padding: 11px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; margin-top: 4px; box-shadow: 0 4px 16px rgba(99,102,241,0.35); letter-spacing: 0.01em; }
                .prime-btn:hover { background: linear-gradient(135deg, #4338ca, #3730a3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.5); }
                .prime-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

                .list-card { background: rgba(255,255,255,0.03); border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
                .list-card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
                .list-card-header h3 { font-size: 0.82rem; font-weight: 700; margin: 0; color: #f1f5f9; padding: 0; border: none; }
                .list-count { background: rgba(99,102,241,0.2); color: #a5b4fc; font-size: 0.69rem; font-weight: 700; padding: 2px 10px; border-radius: 99px; }

                .rich-list { padding: 8px; display: flex; flex-direction: column; gap: 8px; }
                .rich-item { padding: 14px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); transition: all 0.18s; background: rgba(255,255,255,0.03); }
                .rich-item:hover { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); box-shadow: 0 2px 8px rgba(0,0,0,0.2); transform: translateY(-1px); }
                .rich-item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
                .rich-item-info { flex: 1; min-width: 0; }
                .rich-title { font-size: 0.83rem; font-weight: 700; color: #f1f5f9; margin: 0; }
                .rich-desc { font-size: 0.72rem; color: #94a3b8; margin: 4px 0 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .rich-item-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
                .rich-item-meta span { font-size: 0.69rem; color: #64748b; font-weight: 500; white-space: nowrap; }

                .empty-state { padding: 48px 24px; text-align: center; color: #64748b; font-size: 0.82rem; }

                /* ── Professional Cards ── */
                .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
                .pro-card { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); box-shadow: 0 4px 20px rgba(0,0,0,0.25); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s, border-color 0.3s; will-change: transform; }
                .pro-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 15px rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.35); }
                .pro-card-img { height: 160px; background-size: cover; background-position: center; position: relative; overflow: hidden; }
                .pro-card-image { width: 100%; height: 100%; object-fit: cover; display: block; }
                .pro-card-gradient { width: 100%; height: 100%; }
                .pro-card-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%); display: flex; align-items: flex-end; justify-content: space-between; padding: 12px; }
                .cat-badge { background: rgba(59,130,246,0.85); color: #e0f2fe; font-size: 0.6rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; letter-spacing: 0.06em; border: 1px solid rgba(59,130,246,0.5); }
                .pro-card-body { padding: 16px; }
                .pro-card-title { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; margin: 0 0 6px; }
                .pro-card-desc { font-size: 0.73rem; color: #94a3b8; line-height: 1.55; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .pro-card-meta { display: flex; flex-wrap: wrap; gap: 10px; }
                .pro-card-meta span { font-size: 0.7rem; color: #3b82f6; font-weight: 500; }

                /* ── Drop Zone ── */
                .drop-zone { border: 2px dashed rgba(255,255,255,0.15); border-radius: 10px; padding: 20px; cursor: pointer; text-align: center; transition: all 0.18s; background: rgba(255,255,255,0.03); }
                .drop-zone:hover, .drop-zone.drag-over { border-color: #3b82f6; background: rgba(59,130,246,0.06); }
                .drop-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #9ca3af; font-size: 0.75rem; }
                .drop-preview { max-height: 120px; max-width: 100%; object-fit: cover; border-radius: 8px; }
                .drop-preview-wrap { position: relative; display: inline-block; }
                .drop-remove-btn { position: absolute; top: -6px; right: -6px; width: 24px; height: 24px; border-radius: 50%; background: #ef4444; color: #fff; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; box-shadow: 0 2px 6px rgba(239,68,68,0.35); padding: 0; }
                .drop-remove-btn:hover { background: #dc2626; transform: scale(1.15); }

                /* ── News ── */
                .news-stack { display: flex; flex-direction: column; gap: 14px; }
                .news-card-pro { background: rgba(255,255,255,0.04); border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); display: flex; gap: 20px; padding: 22px; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
                .news-card-pro:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.3), 0 0 10px rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); }
                .news-card-pro.news-imp { border-left: 4px solid #ef4444; }
                .news-badge-wrap { flex-shrink: 0; }
                .badge-red-soft { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
                .badge-blue-soft { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); }
                .news-item-badge { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 6px; display: inline-block; }
                .news-body-wrap { flex: 1; min-width: 0; }
                .news-h { font-size: 1rem; font-weight: 700; margin: 0 0 6px; color: #f1f5f9; }
                .news-p { font-size: 0.83rem; line-height: 1.65; color: #94a3b8; margin: 0 0 12px; }
                .news-footer { display: flex; gap: 12px; font-size: 0.7rem; color: #64748b; font-weight: 500; }
                .news-del-btn { background: rgba(239,68,68,0.1); border: 1.5px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 6px 14px; border-radius: 10px; cursor: pointer; transition: all 0.18s; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 8px; align-self: flex-start; font-size: 0.79rem; font-weight: 600; }
                .news-del-btn:hover { background: #ef4444; border-color: #ef4444; color: #fff; transform: scale(1.02); }
                .news-del-btn span { margin-top: -1px; }

                /* ── Settings ── */
                .settings-compact-wrap { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; padding: 16px 0; width: 100%; }
                .settings-compact-card { background: rgba(255,255,255,0.04); border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); padding: 36px 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); width: 100%; }

                /* Profile Upload */
                .profile-upload-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
                .profile-img-container { position: relative; width: 90px; height: 90px; border-radius: 50%; overflow: visible; }
                .profile-preview-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #c8d946; }
                .profile-initials { width: 90px; height: 90px; border-radius: 50%; background: #c8d946; color: #fff; font-size: 1.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 3px solid #b8c836; }
                .profile-upload-btn { position: absolute; bottom: 2px; right: 2px; width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(59,130,246,0.4); transition: background 0.2s; }
                .profile-upload-btn:hover { background: #2563eb; }
                .upload-hint-text { font-size: 0.75rem; color: #9ca3af; margin-top: 8px; }

                /* Profile Form Grid */
                .profile-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px; }
                .pf-group { display: flex; flex-direction: column; gap: 6px; }
                .pf-group label { font-size: 0.7rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; }
                .pf-full { grid-column: 1 / -1; }
                .pf-input-wrap { position: relative; display: flex; align-items: center; }
                .pf-input-wrap input { width: 100%; padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.88rem; color: #1f2937; background: #fff; transition: border-color 0.2s, box-shadow 0.2s; }
                .pf-input-wrap input:focus { outline: none; border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
                .pf-check { position: absolute; right: 12px; color: #14b8a6; font-size: 0.85rem; font-weight: 700; }
                .pf-select-wrap select { width: 100%; padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.88rem; color: #1f2937; background: #fff; appearance: none; cursor: pointer; }
                .pf-select-wrap select:focus { outline: none; border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
                .pf-select-wrap { position: relative; }
                .pf-select-wrap::after { content: '▾'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; font-size: 0.8rem; }

                /* Password */
                .pf-password-wrap { position: relative; }
                .pf-toggle-pw { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; display: flex; }
                .pf-toggle-pw:hover { color: #6b7280; }
                .pf-hint { font-size: 0.7rem; color: #9ca3af; margin-top: 2px; }

                /* Divider & Actions */
                .pf-divider { grid-column: 1 / -1; border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
                .pf-actions { display: flex; justify-content: center; }
                .pf-save-btn { padding: 11px 36px; background: #2563eb; color: #fff; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .pf-save-btn:hover:not(:disabled) { background: #1d4ed8; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
                .pf-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                @media (max-width: 600px) { .profile-form-grid { grid-template-columns: 1fr; } }



                /* ── Section Headers ── */
                .section-header { margin-bottom: 22px; }
                .settings-header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; margin-bottom: 28px; width: 100%; }
                .settings-header svg { color: #3b82f6; margin-bottom: 2px; }
                .section-header h2 { font-size: 1.15rem; font-weight: 800; color: #f1f5f9; margin: 0; letter-spacing: -0.02em; }
                .section-header p { font-size: 0.76rem; color: #64748b; margin: 5px 0 0; }

                /* Theme Toggle UI */
                .settings-section-title { font-size: 0.95rem; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; display: flex; align-items: center; gap: 8px; }
                .settings-section-desc { font-size: 0.8rem; color: #64748b; margin: 0 0 16px; }
                .theme-toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
                .theme-pill { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.04); cursor: pointer; color: #94a3b8; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
                .theme-pill:hover { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.3); color: #93c5fd; }
                .theme-pill.active { background: rgba(59,130,246,0.15); border-color: #3b82f6; color: #93c5fd; box-shadow: 0 0 16px rgba(59,130,246,0.2); }
                .theme-pill svg { transition: transform 0.2s; }
                .theme-pill.active svg { transform: scale(1.1); }

                /* ── Settings Form fields ── */
                .pf-group label { color: #64748b; }
                .pf-input-wrap input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 8px; padding: 10px 14px; width: 100%; font-size: 0.88rem; transition: all 0.2s; }
                .pf-input-wrap input:focus { outline: none; border-color: rgba(59,130,246,0.6); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); background: rgba(255,255,255,0.08); }
                .pf-input-wrap input::placeholder { color: #475569; }
                .pf-select-wrap select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 8px; padding: 10px 14px; width: 100%; font-size: 0.88rem; appearance: none; cursor: pointer; }
                .pf-select-wrap select:focus { outline: none; border-color: rgba(59,130,246,0.6); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
                .pf-select-wrap select option { background: #0f172a; color: #e2e8f0; }
                .pf-check { color: #3b82f6; }
                .pf-hint { color: #64748b; }
                .pf-save-btn { padding: 11px 36px; background: linear-gradient(135deg, #6366f1, #4338ca); color: #fff; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px rgba(99,102,241,0.35); }
                .pf-save-btn:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(99,102,241,0.5); transform: translateY(-2px); }
                .pf-save-btn:disabled { opacity: 0.45; cursor: not-allowed; }
                .account-card { background: rgba(239,68,68,0.06); border-radius: 14px; border: 1px solid rgba(239,68,68,0.2); padding: 22px; margin-top: 16px; }
                .account-title { font-size: 0.92rem; font-weight: 700; color: #fca5a5; margin: 0 0 6px; display: flex; align-items: center; gap: 8px; }
                .account-desc { font-size: 0.75rem; color: #64748b; margin: 0 0 14px; }
                .sign-out-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.35); border-radius: 9px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .sign-out-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; box-shadow: 0 4px 16px rgba(239,68,68,0.4); }

                /* ── Loading / Toast ── */
                .coord-loader-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; color: #64748b; font-size: 0.82rem; }
                .coord-spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.08); border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .coord-global-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 0.82rem; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 9999; animation: slideDown 0.3s ease-out; }
                .coord-global-toast.error { background: #ef4444; border-color: #ef4444; }
                @keyframes slideDown { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

                /* ══════════════════════════════════════════
                   LIGHT MODE — full coordinator overrides
                ══════════════════════════════════════════ */

                /* Root container + scrollable view */
                [data-theme="light"] .coord-container { background: #f0f4ff; color: #0f172a; }
                [data-theme="light"] .coord-view { background: #f0f4ff; }
                [data-theme="light"] .coord-view::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }

                /* ── SIDEBAR — always stays dark for contrast ── */
                [data-theme="light"] .coord-sidebar { background: #0f172a !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; border-right-color: rgba(255,255,255,0.06); }
                [data-theme="light"] .sb-logo-wrap { border-bottom-color: rgba(255,255,255,0.08); }
                [data-theme="light"] .sb-nav-link { color: #94a3b8; }
                [data-theme="light"] .sb-nav-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
                [data-theme="light"] .sb-nav-link.active { background: rgba(59,130,246,0.15); color: #3b82f6; border-color: rgba(59,130,246,0.3); }
                [data-theme="light"] .sb-user-info { background: rgba(0,0,0,0.2); border-top-color: rgba(255,255,255,0.08); }
                [data-theme="light"] .sb-user-name { color: #fff; }
                [data-theme="light"] .sb-user-role { color: #94a3b8; }

                /* ── Top header bar ── */
                [data-theme="light"] .coord-view-header { background: rgba(255,255,255,0.92); border-bottom: 1px solid rgba(100,116,139,0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                [data-theme="light"] .page-header-title { color: #0f172a; }
                [data-theme="light"] .page-header-subtitle { color: #64748b; opacity: 1; }

                /* ── Refresh button ── */
                [data-theme="light"] .btn-refresh-coord { background: rgba(79,70,229,0.08); border-color: rgba(79,70,229,0.2); color: #4f46e5; }
                [data-theme="light"] .btn-refresh-coord:hover { background: rgba(79,70,229,0.15); border-color: rgba(79,70,229,0.35); box-shadow: 0 4px 12px rgba(79,70,229,0.15); }

                /* ── Section headers ── */
                [data-theme="light"] .section-header h2 { color: #0f172a; }
                [data-theme="light"] .section-header p { color: #64748b; }
                [data-theme="light"] .list-count { color: #4f46e5; }

                /* ── Metric stat cards ── */
                [data-theme="light"] .metric-card { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                [data-theme="light"] .metric-card:hover { background: #f8faff; border-color: rgba(79,70,229,0.3); box-shadow: 0 12px 30px rgba(0,0,0,0.1), 0 0 15px rgba(79,70,229,0.1); }
                [data-theme="light"] .metric-card::before { background: linear-gradient(135deg, rgba(79,70,229,0.03) 0%, transparent 100%); }
                [data-theme="light"] .metric-val { color: #0f172a; }
                [data-theme="light"] .metric-label { color: #64748b; }

                /* ── Split panel (recent events/clubs) ── */
                [data-theme="light"] .coord-split-col { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                [data-theme="light"] .split-header { border-bottom-color: #e2e8f0; }
                [data-theme="light"] .split-header h3 { color: #0f172a; }
                [data-theme="light"] .split-item:hover { background: rgba(79,70,229,0.04); }
                [data-theme="light"] .item-main { color: #0f172a; }
                [data-theme="light"] .item-sub { color: #64748b; }
                [data-theme="light"] .empty-hint { color: #94a3b8; }

                /* ── Pro-cards (Events/Clubs grid) ── */
                [data-theme="light"] .pro-card { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                [data-theme="light"] .pro-card:hover { background: #f8faff; border-color: rgba(79,70,229,0.3); }
                [data-theme="light"] .pro-card-title { color: #0f172a; }
                [data-theme="light"] .pro-card-desc { color: #475569; }
                [data-theme="light"] .pro-card-meta span { color: #4f46e5; }

                /* ── Rich list items (dashboard overview) ── */
                [data-theme="light"] .rich-list-item { background: #ffffff; border-color: #e2e8f0; }
                [data-theme="light"] .rich-list-item:hover { background: #f8faff; }
                [data-theme="light"] .rich-title { color: #0f172a; }
                [data-theme="light"] .rich-desc { color: #475569; }
                [data-theme="light"] .rich-item-meta span { color: #64748b; }

                /* ── Create form (compact-card) ── */
                [data-theme="light"] .compact-card { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 8px 32px rgba(0,0,0,0.06); }
                [data-theme="light"] .compact-card h3 { color: #0f172a; }
                [data-theme="light"] .form-row label { color: #374151; }
                [data-theme="light"] .form-hint { color: #64748b; }
                [data-theme="light"] .compact-form input,
                [data-theme="light"] .compact-form select,
                [data-theme="light"] .compact-form textarea { background: #f8fafc; border-color: #d1d5db; color: #0f172a; }
                [data-theme="light"] .compact-form input::placeholder,
                [data-theme="light"] .compact-form textarea::placeholder { color: #94a3b8; }
                [data-theme="light"] .compact-form input:focus,
                [data-theme="light"] .compact-form select:focus,
                [data-theme="light"] .compact-form textarea:focus { border-color: #4f46e5; background: #fff; }

                /* ── Drop zone ── */
                [data-theme="light"] .drop-zone { border-color: rgba(100,116,139,0.3); background: #f8fafc; }
                [data-theme="light"] .drop-zone:hover, [data-theme="light"] .drop-zone.drag-over { border-color: #4f46e5; background: rgba(79,70,229,0.04); }

                /* ── News cards ── */
                [data-theme="light"] .news-card-pro { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                [data-theme="light"] .news-card-pro:hover { background: #f8faff; border-color: rgba(79,70,229,0.3); }
                [data-theme="light"] .news-h { color: #0f172a; }
                [data-theme="light"] .news-p { color: #475569; }
                [data-theme="light"] .news-footer { color: #94a3b8; }

                /* ── Settings card ── */
                [data-theme="light"] .settings-compact-card { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
                [data-theme="light"] .settings-section-title { color: #0f172a; }
                [data-theme="light"] .settings-section-desc { color: #64748b; }
                [data-theme="light"] .theme-pill { background: #f1f5f9; border-color: #e2e8f0; color: #475569; }
                [data-theme="light"] .theme-pill:hover { background: #e8eeff; border-color: rgba(79,70,229,0.3); color: #4f46e5; }
                [data-theme="light"] .theme-pill.active { background: #e8eeff; border-color: #4f46e5; color: #4f46e5; box-shadow: 0 0 12px rgba(79,70,229,0.15); }
                [data-theme="light"] .account-card { background: rgba(239,68,68,0.04); border-color: rgba(239,68,68,0.15); }
                [data-theme="light"] .account-title { color: #dc2626; }
                [data-theme="light"] .account-desc { color: #64748b; }
                [data-theme="light"] .upload-hint-text { color: #64748b; }

                /* ── Profile form inputs ── */
                [data-theme="light"] .pf-group label { color: #374151; }
                [data-theme="light"] .pf-input-wrap input { background: #f8fafc; border-color: #d1d5db; color: #0f172a; }
                [data-theme="light"] .pf-input-wrap input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
                [data-theme="light"] .pf-input-wrap input::placeholder { color: #94a3b8; }
                [data-theme="light"] .pf-select-wrap select { background: #f8fafc; border-color: #d1d5db; color: #0f172a; }
                [data-theme="light"] .pf-select-wrap select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
                [data-theme="light"] .pf-select-wrap select option { background: #fff; color: #0f172a; }
                [data-theme="light"] .pf-select-wrap::after { color: #64748b; }
                [data-theme="light"] .pf-hint { color: #64748b; }
                [data-theme="light"] .pf-check { color: #10b981; }
                [data-theme="light"] .pf-divider { border-top-color: #e5e7eb; }

                /* ── Loader / Toast ── */
                [data-theme="light"] .coord-loader-wrap { color: #64748b; }
                [data-theme="light"] .coord-spinner { border-color: rgba(0,0,0,0.08); border-top-color: #4f46e5; }

                /* ── Scrollbar in light mode ── */
                [data-theme="light"] .coord-view::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.2); }
                [data-theme="light"] .coord-view::-webkit-scrollbar-thumb:hover { background: rgba(79,70,229,0.4); }
            `}</style>
        </div>
    );
};

export default CoordinatorDashboard;


// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('coordinator_token');

const apiFetch = (url) =>
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` }, cache: 'no-store' }).then(r => {
        if (!r.ok) throw new Error('Refresh failed');
        return r.json();
    });

const apiPost = (url, body) =>
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
    });


