import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminNewsPage.css';

const getToken = () => localStorage.getItem('admin_token');

const fmt = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '';

// Shield icon
const ShieldIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const NewsCard = ({ item }) => (
    <div className="anp-card">
        {/* Watermark */}
        <div className="anp-card-watermark">
            <ShieldIcon size={100} />
        </div>

        <div className="anp-card-top">
            <span className="anp-official-badge">
                <ShieldIcon size={11} /> Official Announcement
            </span>
            <span className="anp-date">{fmt(item.createdAt)}</span>
            {item.postedBy?.name && (
                <span className="anp-posted-by">Posted by {item.postedBy.name}</span>
            )}
        </div>

        <h3 className="anp-card-title">{item.title}</h3>
        <p className="anp-card-body">{item.content}</p>
    </div>
);

const AdminNewsPage = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/announcements', {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                const data = await res.json();
                setAnnouncements(Array.isArray(data) ? data : []);
            } catch (e) {
                setError('Failed to load announcements.');
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="anp-page">
            {/* Top bar */}
            <header className="anp-topbar">
                <button className="anp-back-btn" onClick={() => navigate('/admin')}>
                    ← Back to Dashboard
                </button>
                <h1 className="anp-topbar-title">Announcements</h1>
                <span className="anp-topbar-sub">
                    {loading ? '…' : `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}`}
                </span>
            </header>

            <main className="anp-main">
                <div className="anp-page-header">
                    <h2 className="anp-page-title">Live Newsroom</h2>
                    <p className="anp-page-subtitle">
                        All official announcements posted by the administration.
                    </p>
                </div>

                {error && <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>}

                {loading ? (
                    <div className="anp-grid">
                        {[1, 2, 3, 4].map(k => <div key={k} className="anp-skeleton" />)}
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="anp-empty">
                        No announcements yet. Click "Post News" on the dashboard to add one.
                    </div>
                ) : (
                    <div className="anp-grid">
                        {announcements.map(item => (
                            <NewsCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminNewsPage;
