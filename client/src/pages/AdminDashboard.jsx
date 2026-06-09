import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import './AdminDashboard.css';

const getToken = () => localStorage.getItem('admin_token');
const apiFetch = (url) => fetch(url, { headers: { Authorization: `Bearer ${getToken()}` }, cache: 'no-store' }).then(r => r.json());

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = {
    Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    Events: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Clubs: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    News: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2z" /><polyline points="16 2 16 11 12 8 8 11 8 2" /></svg>,
    Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>,
    Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
    Back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>,
    Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Refresh: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
    Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    Bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Graduate: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    Warn: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    Alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
};

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmDeleteModal = ({ label, onConfirm, onCancel, loading }) => (
    <div className="adm-overlay" onClick={onCancel}>
        <div className="adm-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                    <Ico.Trash />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', margin: 0 }}>Delete {label}?</h3>
                <p style={{ fontSize: '.82rem', color: 'var(--t3)', margin: 0 }}>This cannot be undone. It will be removed from all portals immediately.</p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: 20 }}>
                <button className="adm-btn ghost" onClick={onCancel} disabled={loading}>Cancel</button>
                <button className="adm-btn danger" onClick={onConfirm} disabled={loading}>
                    {loading ? 'Deleting…' : 'Yes, delete'}
                </button>
            </div>
        </div>
    </div>
);

// ─── Logout Confirm ───────────────────────────────────────────────────────────
const LogoutModal = ({ onConfirm, onCancel }) => (
    <div className="adm-overlay" onClick={onCancel}>
        <div className="adm-modal logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-icon"><Ico.Warn /></div>
            <h3 className="logout-title">Sign out?</h3>
            <p className="logout-sub">You'll be redirected to the login page.</p>
            <div className="modal-actions">
                <button className="adm-btn ghost" onClick={onCancel}>Cancel</button>
                <button className="adm-btn danger" onClick={onConfirm}>Yes, sign out</button>
            </div>
        </div>
    </div>
);

// ─── Create Update Modal (News + Announcement) ───────────────────────────────
const CreateUpdateModal = ({ onClose, onPosted }) => {
    const [type, setType] = useState('announcement');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const submit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ title, content, type }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            onPosted(data); onClose();
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };
    const isAnn = type === 'announcement';
    return (
        <div className="adm-overlay" onClick={onClose}>
            <div className="adm-modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Create Update</h3>

                {/* Type selector */}
                <div className="upd-type-row">
                    <button
                        type="button"
                        className={`upd-type-btn${type === 'news' ? ' upd-type-active-news' : ''}`}
                        onClick={() => setType('news')}
                    >
                        <span className="upd-type-dot upd-dot-news" />
                        News
                    </button>
                    <button
                        type="button"
                        className={`upd-type-btn${isAnn ? ' upd-type-active-ann' : ''}`}
                        onClick={() => setType('announcement')}
                    >
                        <span className="upd-type-dot upd-dot-ann" />
                        Announcement
                    </button>
                </div>

                {/* Type hint */}
                <p className="upd-type-hint">
                    {isAnn
                        ? '⚠ Used for exams, deadlines, urgent notices — shown with red accent.'
                        : 'ℹ Used for holidays, updates, general info — shown with blue accent.'}
                </p>

                {error && <p className="modal-err">{error}</p>}
                <form onSubmit={submit}>
                    <label className="adm-label">Title</label>
                    <input className="adm-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder={isAnn ? 'e.g.  Midterm or Fees' : 'e.g. Events, Clubs Holidays'} />
                    <label className="adm-label">Content</label>
                    <textarea className="adm-input" rows={4} value={content} onChange={e => setContent(e.target.value)} required placeholder="Write your message…" style={{ resize: 'vertical' }} />
                    <div className="modal-actions" style={{ marginTop: 16 }}>
                        <button type="button" className="adm-btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className={`adm-btn ${isAnn ? 'danger' : 'primary'}`} disabled={loading}>
                            {loading ? 'Posting…' : `Post ${isAnn ? 'Announcement' : 'News'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Shared small components ──────────────────────────────────────────────────
const StatCard = ({ IcoComp, label, value, accent, sub, onClick }) => (
    <div className={`stat-card accent-${accent}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
        <div className="stat-ico-wrap"><IcoComp /></div>
        <div className="stat-info">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
            {sub && <span className="stat-sub">{sub}</span>}
        </div>
    </div>
);

const NewsItem = ({ item, onDelete }) => {
    const isAnn = item.type === 'announcement' || !item.type; // backward compat
    return (
        <div className={`news-item${isAnn ? ' news-item-ann' : ' news-item-news'}`}>
            <div className="news-item-left">
                {isAnn ? (
                    <span className="badge-ann">
                        <Ico.Alert /> IMPORTANT
                    </span>
                ) : (
                    <span className="badge-news">NEWS</span>
                )}
                <h4 className={`news-title${isAnn ? ' news-title-ann' : ''}`}>{item.title}</h4>
                <span className="news-meta">{fmtDate(item.createdAt)}{item.postedBy?.name ? ` · ${item.postedBy.name}` : ''}</span>
                <p className="news-body">{item.content}</p>
            </div>
            <button className="news-del-btn" onClick={() => onDelete(item._id, item.title)} title="Delete news">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
            </button>
        </div>
    );
};

const CardSkeleton = ({ n = 3 }) => (
    <div className="sk-grid">{Array.from({ length: n }).map((_, i) => <div key={i} className="sk-card"><div className="sk-img" /><div className="sk-lines"><div /><div /><div /></div></div>)}</div>
);
const ListSkeleton = () => <div className="sk-list">{[1, 2, 3].map(k => <div key={k} className="sk-row" />)}</div>;


// ─── Students Modal (Registrations / Members) ─────────────────────────────────
const StudentsModal = ({ title, onClose }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error,   setError]     = useState('');
    const [q,       setQ]         = useState('');

    useEffect(() => {
        if (title.students) {
            setStudents(title.students);
            setLoading(false);
        } else {
            setStudents([]);
            setLoading(false); 
        }
    }, [title]);

    // Search filter
    const filtered = students.filter(s =>
        !q ||
        (s.name || '').toLowerCase().includes(q.toLowerCase()) ||
        (s.regNumber || '').toLowerCase().includes(q.toLowerCase()) ||
        (s.semester || '').toString().includes(q) ||
        (s.section  || '').toLowerCase().includes(q.toLowerCase())
    );

    // CSV Export
    const exportCSV = () => {
        const header = 'Name,Email,Reg Number,Semester,Section,Course';
        const rows   = students.map(s =>
            `"${s.name || ''}","${s.email || ''}","${s.regNumber || ''}","${s.semester || ''}","${s.section || ''}","${s.course || ''}"`);
        const csv  = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a    = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: `${title.label.replace(/\s+/g, '_')}_students.csv`,
        });
        a.click();
    };

    return (
        <div className="adm-overlay" onClick={onClose}>
            <div
                className="adm-modal"
                style={{ maxWidth: 760, width: '94%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--t1)' }}>{title.label}</h3>
                        {!loading && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--t3)', marginTop: 3, display: 'block' }}>
                                {students.length} student{students.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {students.length > 0 && (
                            <button
                                onClick={exportCSV}
                                style={{
                                    padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600,
                                    background: 'var(--primary)', color: '#fff', border: 'none',
                                    borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Export CSV
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '1.4rem', lineHeight: 1, padding: '0 4px' }}>✕</button>
                    </div>
                </div>

                {/* Search */}
                {!loading && students.length > 0 && (
                    <div className="search-box" style={{ marginBottom: 14, flexShrink: 0 }}>
                        <span className="s-ico"><Ico.Search /></span>
                        <input className="s-inp" placeholder="Search by name, reg number, semester…" value={q} onChange={e => setQ(e.target.value)} />
                        {q && <button className="s-clr" onClick={() => setQ('')}>✕</button>}
                    </div>
                )}

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 12 }}>
                            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <span style={{ color: 'var(--t3)', fontSize: '0.82rem' }}>Loading students…</span>
                        </div>
                    )}
                    {error && <div className="error-bar" style={{ margin: 0 }}><Ico.Warn /> {error}</div>}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="empty-state" style={{ margin: 0 }}>{q ? 'No students match your search.' : 'No students registered yet.'}</div>
                    )}
                    {!loading && !error && filtered.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    {['#', 'Name', 'Reg Number', 'Semester', 'Section', 'Course'].map(h => (
                                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--t3)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <tr key={s._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '10px 12px', color: 'var(--t3)', width: 36 }}>{i + 1}</td>
                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--t1)' }}>
                                            {s.name || '—'}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: 'var(--t2)', fontFamily: 'monospace' }}>{s.regNumber || '—'}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--t2)' }}>{s.semester ? `Sem ${s.semester}` : '—'}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--t2)' }}>{s.section || '—'}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--t2)' }}>{s.course || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};


// ══════════════════════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════════════════════
const DashboardPage = ({ stats, events, clubs, announcements, loading, onNav }) => {
    const approved = events.filter(e => e.status === 'approved').length;
    return (
        <div className="page">
            <div className="stats-grid">
                <StatCard IcoComp={Ico.Events} label="Total Events" value={stats.events} accent="blue" sub={`${approved} approved`} onClick={() => onNav('events')} />
                <StatCard IcoComp={Ico.Clubs} label="Active Clubs" value={stats.clubs} accent="pink" sub="Tap to manage" onClick={() => onNav('clubs')} />
                <StatCard IcoComp={Ico.Bell} label="Announcements" value={stats.announcements} accent="purple" sub="Tap to view" onClick={() => onNav('newsroom')} />
                <StatCard IcoComp={Ico.Graduate} label="Event Registrations" value={stats.students} accent="green" sub="Students registered for events" />
                <StatCard IcoComp={Ico.Clubs} label="Active Members" value={stats.activeMembers} accent="blue" sub="Total club memberships" onClick={() => onNav('clubs')} />
            </div>
            <div className="recent-grid">
                <div className="panel">
                    <div className="panel-head"><span className="panel-title">Recent Events</span><button className="txt-btn" onClick={() => onNav('events')}>View all →</button></div>
                    {loading ? <ListSkeleton /> : events.slice(0, 2).length === 0 ? <p className="panel-empty">No events yet.</p> : (
                        <ul className="act-list">{events.slice(0, 2).map(ev => (
                            <li key={ev._id} className="act-item">
                                <div className="act-body"><span className="act-title">{ev.title}</span><span className="act-meta">{ev.venue} · {fmtDate(ev.date)}</span></div>
                                <span className={`pill pill-${ev.status === 'approved' ? 'green' : 'amber'}`}>{ev.status === 'approved' ? 'Approved' : 'Pending'}</span>
                            </li>
                        ))}</ul>
                    )}
                </div>
                <div className="panel">
                    <div className="panel-head"><span className="panel-title">Recent Announcements</span><button className="txt-btn" onClick={() => onNav('newsroom')}>View all →</button></div>
                    {loading ? <ListSkeleton /> : announcements.slice(0, 2).length === 0 ? <p className="panel-empty">No announcements yet.</p> : (
                        <ul className="act-list">{announcements.slice(0, 2).map(item => (
                            <li key={item._id} className="act-item">
                                <div className="act-body"><span className="act-title">{item.title}</span><span className="act-meta">{fmtDate(item.createdAt)}</span></div>
                                <span className="pill pill-blue">Official</span>
                            </li>
                        ))}</ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const EventsPage = ({ events, loading, onDelete, onViewStudents }) => {
    const [q, setQ] = useState('');
    const [f, setF] = useState('all');
    const shown = events.filter(ev => {
        const mq = ev.title.toLowerCase().includes(q.toLowerCase()) || (ev.venue || '').toLowerCase().includes(q.toLowerCase());
        const mf = f === 'all' || ev.status === f;
        return mq && mf;
    });
    const cnt = { 
        all: events.length, 
        approved: events.filter(e => e.status === 'approved').length, 
        pending: events.filter(e => e.status === 'pending').length,
        rejected: events.filter(e => e.status === 'rejected').length
    };
    return (
        <div className="page">
            <div className="toolbar">
                <div className="search-box"><span className="s-ico"><Ico.Search /></span><input className="s-inp" placeholder="Search events…" value={q} onChange={e => setQ(e.target.value)} />{q && <button className="s-clr" onClick={() => setQ('')}>✕</button>}</div>
                <div className="filter-grp">{['all', 'approved', 'pending', 'rejected'].map(x => (
                    <button key={x} className={`f-btn${f === x ? ' f-active' : ''}`} onClick={() => setF(x)}>
                        {x.charAt(0).toUpperCase() + x.slice(1)}<span className="f-cnt">{cnt[x]}</span>
                    </button>
                ))}</div>
            </div>
            {loading ? <CardSkeleton /> : shown.length === 0 ? <div className="empty-state">{q || f !== 'all' ? 'No events match your filters.' : 'No events yet.'}</div> :
                <div className="ec-grid">
                    {shown.map((ev, i) => (
                        <EventCard key={ev._id} event={ev} index={i} role="admin" onDelete={onDelete} onViewStudents={onViewStudents} />
                    ))}
                </div>
            }
        </div>
    );
};


const ClubsPage = ({ clubs, loading, onDelete, onViewStudents }) => {
    const [q, setQ] = useState('');
    const [f, setF] = useState('all');
    const shown = clubs.filter(c => {
        const mq = c.name.toLowerCase().includes(q.toLowerCase()) || (c.category || '').toLowerCase().includes(q.toLowerCase());
        const mf = f === 'all' || c.status === f;
        return mq && mf;
    });
    const cnt = { 
        all: clubs.length, 
        approved: clubs.filter(c => c.status === 'approved').length, 
        pending: clubs.filter(c => c.status === 'pending').length,
        rejected: clubs.filter(c => c.status === 'rejected').length
    };
    return (
        <div className="page">
            <div className="toolbar">
                <div className="search-box">
                    <span className="s-ico"><Ico.Search /></span>
                    <input className="s-inp" placeholder="Search clubs…" value={q} onChange={e => setQ(e.target.value)} />
                    {q && <button className="s-clr" onClick={() => setQ('')}>✕</button>}
                </div>
                <div className="filter-grp">
                    {['all', 'approved', 'pending', 'rejected'].map(x => (
                        <button key={x} className={`f-btn${f === x ? ' f-active' : ''}`} onClick={() => setF(x)}>
                            {x.charAt(0).toUpperCase() + x.slice(1)}<span className="f-cnt">{cnt[x]}</span>
                        </button>
                    ))}
                </div>
            </div>
            {loading ? <CardSkeleton /> : shown.length === 0 ? <div className="empty-state">{q || f !== 'all' ? 'No clubs match your filters.' : 'No clubs yet.'}</div> :
                <div className="cc-grid">
                    {shown.map((c, i) => (
                        <ClubCard key={c._id} club={c} index={i} role="admin" onDelete={onDelete} onViewStudents={onViewStudents} />
                    ))}
                </div>
            }
        </div>
    );
};


const RequestsPage = ({ events, clubs, loading, onUpdateStatus, onDelete }) => {
    const [tab, setTab] = useState('events');
    const pEvents = events.filter(e => e.status === 'pending');
    const pClubs = clubs.filter(c => c.status === 'pending');

    return (
        <div className="page">
            <div className="req-tabs">
                <button className={`req-tab ${tab === 'events' ? 'req-tab-active' : ''}`} onClick={() => setTab('events')}>
                    Pending Events <span className="tab-cnt">{pEvents.length}</span>
                </button>
                <button className={`req-tab ${tab === 'clubs' ? 'req-tab-active' : ''}`} onClick={() => setTab('clubs')}>
                    Pending Clubs <span className="tab-cnt">{pClubs.length}</span>
                </button>
            </div>

            {loading ? <ListSkeleton /> : (
                <div className="req-list">
                    {tab === 'events' && (
                        pEvents.length === 0 ? <div className="empty-state">No pending events.</div> :
                            pEvents.map(ev => (
                                <div key={ev._id} className="req-item-card">
                                    <div className="req-item-body">
                                        <h4 className="req-item-title">{ev.title}</h4>
                                        <p className="req-item-desc">{ev.description}</p>
                                        <div className="req-item-meta" style={{ marginBottom: '12px' }}>
                                            <span>📍 {ev.venue}</span>
                                            <span>📅 {fmtDate(ev.date)}</span>
                                        </div>
                                        
                                        <div className="req-creator-box">
                                            <div className="rc-avatar">{(ev.createdBy?.name || 'C').charAt(0).toUpperCase()}</div>
                                            <div className="rc-info">
                                                <div className="rc-name">Created by: {ev.createdBy?.name || 'Coordinator'} {ev.createdBy?.regNumber ? <span className="rc-reg">({ev.createdBy.regNumber})</span> : ''}</div>
                                                <div className="rc-course">{[ev.createdBy?.course, ev.createdBy?.semester ? `Sem ${ev.createdBy.semester}` : '', ev.createdBy?.section ? `Section ${ev.createdBy.section}` : ''].filter(Boolean).join(' | ')}</div>
                                                <div className="rc-date">Created on: {new Date(ev.createdAt || Date.now()).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'})}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="req-item-actions">
                                        <button className="adm-btn ghost sm" onClick={() => onDelete('event', ev._id, ev.title)}>Delete</button>
                                        <button className="adm-btn danger sm" onClick={() => onUpdateStatus('event', ev._id, 'rejected')}>Reject</button>
                                        <button className="adm-btn primary sm" onClick={() => onUpdateStatus('event', ev._id, 'approved')}>Approve</button>
                                    </div>
                                </div>
                            ))
                    )}
                    {tab === 'clubs' && (
                        pClubs.length === 0 ? <div className="empty-state">No pending clubs.</div> :
                            pClubs.map(c => (
                                <div key={c._id} className="req-item-card">
                                    <div className="req-item-body">
                                        <h4 className="req-item-title">{c.name}</h4>
                                        <p className="req-item-desc">{c.description}</p>
                                        <div className="req-item-meta" style={{ marginBottom: '12px' }}>
                                            <span>🏷 {c.category || 'General'}</span>
                                            <span>🎓 Advisor: {c.facultyAdvisor || 'N/A'}</span>
                                        </div>

                                        <div className="req-creator-box">
                                            <div className="rc-avatar">{(c.coordinator?.name || 'C').charAt(0).toUpperCase()}</div>
                                            <div className="rc-info">
                                                <div className="rc-name">Created by: {c.coordinator?.name || 'User'} {c.coordinator?.regNumber ? <span className="rc-reg">({c.coordinator.regNumber})</span> : ''}</div>
                                                <div className="rc-course">{[c.coordinator?.course, c.coordinator?.semester ? `Sem ${c.coordinator.semester}` : '', c.coordinator?.section ? `Section ${c.coordinator.section}` : ''].filter(Boolean).join(' | ')}</div>
                                                <div className="rc-date">Created on: {new Date(c.createdAt || Date.now()).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'})}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="req-item-actions">
                                        <button className="adm-btn ghost sm" onClick={() => onDelete('club', c._id, c.name)}>Delete</button>
                                        <button className="adm-btn danger sm" onClick={() => onUpdateStatus('club', c._id, 'rejected')}>Reject</button>
                                        <button className="adm-btn primary sm" onClick={() => onUpdateStatus('club', c._id, 'approved')}>Approve</button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            )}
            <style>{`
                .req-creator-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    background: rgba(245, 158, 11, 0.08);
                    border-left: 3px solid #f59e0b;
                    border-radius: 8px;
                    margin-top: 4px;
                }
                .rc-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                    flex-shrink: 0;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
                }
                .rc-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .rc-name {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--t1);
                }
                .rc-reg {
                    color: var(--t3);
                    font-weight: 500;
                }
                .rc-course {
                    font-size: 0.72rem;
                    color: var(--t2);
                    font-weight: 500;
                }
                .rc-date {
                    font-size: 0.68rem;
                    color: var(--amber);
                    font-weight: 600;
                    margin-top: 2px;
                }
            `}</style>
        </div>
    );
};


const NewsroomPage = ({ announcements, loading, onPost, onDelete }) => (
    <div className="page">
        <div className="page-action-bar">
            <button className="adm-btn primary" onClick={onPost}><Ico.Plus /> Post Announcement</button>
        </div>
        {loading ? <ListSkeleton /> : announcements.length === 0 ? <div className="empty-state">No announcements yet.</div> :
            <div className="news-list">{announcements.map(item => <NewsItem key={item._id} item={item} onDelete={onDelete} />)}</div>}
    </div>
);

const SettingsPage = ({ user, onProfileSaved, onLogout }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [photoPreview, setPhotoPreview] = useState(user?.image || null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'ok'|'err', msg }
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('adm-theme') !== 'light');
    const fileRef = React.useRef();

    // ── Sync Prop to State ──
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhotoPreview(user.image || null);
        }
    }, [user]);

    // Apply dark mode on mount + toggle
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('adm-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            showToast('err', 'Only JPG, PNG, or WebP images allowed.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) return showToast('err', 'Name is required.');
        if (!email.trim()) return showToast('err', 'Email is required.');
        if (newPw && newPw !== confirmPw) return showToast('err', 'Passwords do not match.');
        if (newPw && newPw.length < 4) return showToast('err', 'Password must be at least 4 characters.');

        setSaving(true);
        try {
            const body = { name: name.trim(), email: email.trim() };
            if (newPw) body.password = newPw;
            if (photoPreview && photoPreview !== user?.image) body.image = photoPreview;

            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed.');

            // Update sidebar name + avatar immediately — always include role to prevent corruption
            onProfileSaved({ name: data.name, email: data.email, image: data.image, role: data.role }, data.token);
            setNewPw(''); setConfirmPw('');

            if (newPw) {
                showToast('ok', 'Password changed! Logging you out…');
                setTimeout(() => onLogout(), 2200);
            } else {
                showToast('ok', 'Profile saved successfully!');
            }
        } catch (err) {
            showToast('err', err.message);
        } finally {
            setSaving(false);
        }
    };

    const initials = (name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="page settings-pro-page settings-single-col">
            {toast && (
                <div className={`settings-toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                    {toast.type === 'ok' ? '✓' : '✕'} {toast.msg}
                </div>
            )}

            {/* ── Profile Card ─────────────────────────────────────────── */}
            <div className="settings-panel">
                <h3 className="settings-panel-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Profile
                </h3>

                <form onSubmit={handleSave} className="settings-form-pro">
                    {/* Avatar */}
                    <div className="avatar-upload-wrap" onClick={() => fileRef.current.click()} title="Click to change photo">
                        {photoPreview ? (
                            <img src={photoPreview} alt="avatar" className="avatar-img" />
                        ) : (
                            <div className="avatar-initials">{initials}</div>
                        )}
                        <div className="avatar-overlay">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            <span>Upload</span>
                        </div>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} style={{ display: 'none' }} />
                    </div>
                    <p className="avatar-hint">JPG, PNG or WebP · Max 2 MB</p>

                    <div className="sf-field">
                        <label className="sf-label">Full Name <span className="sf-req">*</span></label>
                        <input className="sf-input" value={name} onChange={e => setName(e.target.value)} placeholder="Admin User" required />
                    </div>
                    <div className="sf-field">
                        <label className="sf-label">Email <span className="sf-req">*</span></label>
                        <input className="sf-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required />
                    </div>

                    <div className="sf-divider"><span>Password</span></div>

                    <div className="sf-field">
                        <label className="sf-label">New Password <span className="sf-optional">(optional)</span></label>
                        <input className="sf-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Leave blank to keep current" />
                    </div>
                    {newPw && (
                        <div className="sf-field">
                            <label className="sf-label">Confirm Password <span className="sf-req">*</span></label>
                            <input className={`sf-input ${confirmPw && confirmPw !== newPw ? 'sf-input-err' : confirmPw && confirmPw === newPw ? 'sf-input-ok' : ''}`}
                                type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password" />
                            {confirmPw && confirmPw !== newPw && <span className="sf-err-msg">Passwords don't match</span>}
                        </div>
                    )}

                    <button type="submit" className="sf-save-btn" disabled={saving}>
                        {saving ? (<><span className="sf-spin" /> Saving…</>) : '✓ Save Changes'}
                    </button>
                </form>
            </div>

            {/* ── Dark Mode ────────────────────────────────────────────── */}
            <div className="settings-panel settings-panel-dm">
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

            {/* ── Account ──────────────────────────────────────────────── */}
            <div className="settings-panel settings-panel-danger">
                <h3 className="settings-panel-title danger-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    Account
                </h3>
                <p className="danger-desc">Signing out will end your current session. Your data will remain intact.</p>
                <button type="button" className="danger-logout-btn" onClick={onLogout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign Out
                </button>
            </div>
        </div>
    );
};


// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
const NAV = [
    { id: 'dashboard', label: 'Dashboard', IcoComp: Ico.Dashboard },
    { id: 'requests', label: 'Requests', IcoComp: Ico.Bell },
    { id: 'events', label: 'Events', IcoComp: Ico.Events },
    { id: 'clubs', label: 'Clubs', IcoComp: Ico.Clubs },
    { id: 'newsroom', label: 'Newsroom', IcoComp: Ico.News },
    { id: 'settings', label: 'Settings', IcoComp: Ico.Settings },
];

const Sidebar = ({ page, onNav, user }) => {
    const name = user?.name || 'Admin';
    return (
        <aside className="sidebar">
            <div className="sb-brand">
                <span className="sb-logo"><Ico.Shield /></span>
                <span className="sb-name">Collexa</span>
            </div>
            <nav className="sb-nav">
                {NAV.map(({ id, label, IcoComp }) => (
                    <button key={id} className={`sb-item${page === id ? ' sb-active' : ''} sb-item-${id}`} onClick={() => onNav(id)}>
                        <span className="sb-ico"><IcoComp /></span>
                        <span className="sb-label">{label}</span>
                    </button>
                ))}
            </nav>
            <div className="sb-footer">
                <div className="sb-user">
                    <div className="sb-avatar">
                        {user?.image
                            ? <img src={user.image} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div className="sb-userinfo">
                        <span className="sb-uname">{name}</span>
                        <span className="sb-urole">Administrator</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
    const { user, logout, updateUser } = useAuth();

    // Apply saved dark/light mode on mount (default to dark for admin panel)
    useEffect(() => {
        const saved = localStorage.getItem('adm-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
    }, []);
    const [page, setPage] = useState('dashboard');
    const [events, setEvents] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newsMdl, setNewsMdl] = useState(false);
    const [logoutMdl, setLogoutMdl] = useState(false);
    // { type: 'event'|'club'|'news', id, label }
    const [confirmDel, setConfirmDel] = useState(null);
    const [deleting,   setDeleting]   = useState(false);
    const [viewModal,  setViewModal]  = useState(null); // { label, url }
    const [refreshing, setRefreshing] = useState(false);

    const fetchAll = useCallback(async (background = false) => {
        if (!background) {
            setLoading(true); 
            setError('');
        }
        try {
            const [ev, cl, an] = await Promise.all([
                apiFetch('/api/events/admin-all'), 
                apiFetch('/api/clubs/admin-all'), 
                apiFetch('/api/announcements')
            ]);
            setEvents(Array.isArray(ev) ? ev : []);
            setClubs(Array.isArray(cl) ? cl : []);
            setNews(Array.isArray(an) ? an : []);
        } catch { if (!background) setError('Failed to load data. Is the backend running?'); }
        finally { if (!background) setLoading(false); }
    }, []);

    // Initial fetch + 10s Background Polling
    useEffect(() => { 
        fetchAll(); 
        const interval = setInterval(() => {
            fetchAll(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    const handleManualRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        await fetchAll(true);
        setTimeout(() => setRefreshing(false), 800); // Visual sustain for exactly 1 full rotation
    };

    // ── Delete handlers ──────────────────────────────────────────────────────
    const requestDelete = (type, id, label) => setConfirmDel({ type, id, label });

    const confirmDelete = async () => {
        if (!confirmDel) return;
        setDeleting(true);
        const { type, id } = confirmDel;
        const endpoint = type === 'event' ? `/api/events/${id}` : type === 'club' ? `/api/clubs/${id}` : `/api/announcements/${id}`;
        try {
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            // Read body first so we get the real error message from the server
            let body = {};
            try { body = await res.json(); } catch (_) {}
            if (!res.ok) throw new Error(body.message || `Server returned ${res.status}`);

            if (type === 'event') setEvents(p => p.filter(e => e._id !== id));
            if (type === 'club')  setClubs(p  => p.filter(c => c._id !== id));
            if (type === 'news')  setNews(p   => p.filter(n => n._id !== id));
            setConfirmDel(null);
        } catch (err) {
            setError(err.message);
            setConfirmDel(null);
        } finally { setDeleting(false); }
    };

    const handleUpdateStatus = async (type, id, status) => {
        const endpoint = type === 'event' ? `/api/events/${id}/status` : `/api/clubs/${id}/status`;
        try {
            const currentToken = getToken();
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentToken}`,
                },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            
            if (res.status === 401 || res.status === 403) {
                logout('admin');
                throw new Error(data.message || 'Session invalid or access denied.');
            }
            if (!res.ok) throw new Error(data.message || 'Failed to update status');

            // Local update
            if (type === 'event') setEvents(p => p.map(e => e._id === id ? { ...e, status } : e));
            if (type === 'club') setClubs(p => p.map(c => c._id === id ? { ...c, status } : c));
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const stats = {
        events: events.length, clubs: clubs.length, announcements: news.length,
        // Total registrations across all events (increases each time any student registers)
        students: events.reduce((s, ev) => s + (ev.attendees?.length || 0), 0),
        // Total active club members across all clubs
        activeMembers: clubs.reduce((s, c) => s + (c.members?.length || 0), 0),
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="adm-root">
            <Sidebar page={page} onNav={setPage} user={user} />

            <div className="adm-body">
                <header className="topbar">
                    <div className="tb-left">
                        <h2 className="tb-title">Admin Dashboard</h2>
                        <p className="tb-date">{today}</p>
                    </div>
                    <div className="tb-right">
                        {page !== 'settings' && (
                            <button className={`btn-refresh ${refreshing ? 'rotating' : ''}`} disabled={refreshing} onClick={handleManualRefresh}>
                                <Ico.Refresh /> Refresh
                            </button>
                        )}
                    </div>
                </header>

                {error && <div className="error-bar"><Ico.Warn /> {error}<button className="adm-btn danger" style={{ marginLeft: 'auto' }} onClick={fetchAll}>Retry</button></div>}

                <main className="adm-main">
                    {page === 'dashboard' && <DashboardPage stats={stats} events={events} clubs={clubs} announcements={news} loading={loading} onNav={setPage} />}
                    {page === 'requests' && <RequestsPage events={events} clubs={clubs} loading={loading} onUpdateStatus={handleUpdateStatus} onDelete={(type, id, label) => requestDelete(type, id, label)} />}
                    {page === 'events'    && <EventsPage    events={events}    loading={loading} onDelete={(id, label) => requestDelete('event', id, label)} onViewStudents={setViewModal} />}
                    {page === 'clubs'     && <ClubsPage     clubs={clubs}      loading={loading} onDelete={(id, label) => requestDelete('club',  id, label)} onViewStudents={setViewModal} />}
                    {page === 'newsroom' && <NewsroomPage announcements={news} loading={loading} onPost={() => setNewsMdl(true)} onDelete={(id, label) => requestDelete('news', id, label)} />}
                    {page === 'settings' && <SettingsPage user={user} onProfileSaved={(data, token) => updateUser(data, token)} onLogout={() => { logout(); }} />}
                </main>
            </div>

            {newsMdl    && <CreateUpdateModal onClose={() => setNewsMdl(false)} onPosted={item => setNews(p => [item, ...p])} />}
            {logoutMdl  && <LogoutModal onConfirm={() => { logout(); window.location.href = '/'; }} onCancel={() => setLogoutMdl(false)} />}
            {confirmDel && <ConfirmDeleteModal label={confirmDel.label} loading={deleting} onConfirm={confirmDelete} onCancel={() => setConfirmDel(null)} />}
            {viewModal  && <StudentsModal title={viewModal} onClose={() => setViewModal(null)} />}
        </div>
    );
};

export default AdminDashboard;

