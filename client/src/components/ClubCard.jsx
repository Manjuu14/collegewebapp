import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CLUB_IMAGES, CLUB_GRADIENTS } from '../utils/clubImages';
import './ClubCard.css';
import './EventCard.css'; // Piggyback onto EventCard styles for exact parity

const getClubBg = (name = '', index = 0) => {
    const key = name.toLowerCase();
    if (CLUB_IMAGES[key]) return `url('${CLUB_IMAGES[key]}') center/cover no-repeat`;
    return CLUB_GRADIENTS[index % CLUB_GRADIENTS.length];
};

/* ─── Members Modal (renders at document.body via portal) ─── */
const MembersModal = ({ club, onClose }) => {
    const members = club.members || [];
    const namedMembers = members.filter(m => m && m.name);

    // Close on Escape key
    const handleKey = useCallback(e => { if (e.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [handleKey]);

    return ReactDOM.createPortal(
        <div className="members-overlay" onClick={onClose}>
            <div
                className="members-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Members of ${club.name}`}
            >
                {/* Header */}
                <div className="members-modal-head">
                    <div>
                        <h3 className="members-modal-title">{club.name}</h3>
                        <p className="members-modal-sub">
                            {namedMembers.length} registered student{namedMembers.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button className="members-modal-close" onClick={onClose} aria-label="Close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="members-modal-body">
                    {namedMembers.length === 0 ? (
                        <p className="members-modal-empty">No registered members yet.</p>
                    ) : (
                        <ul className="members-modal-list">
                            {namedMembers.map((m, i) => (
                                <li key={m._id || i} className="members-modal-item">
                                    <div className="members-modal-avatar">
                                        {m.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="members-modal-info">
                                        <span className="members-modal-name">{m.name}</span>
                                        {m.email && (
                                            <span className="members-modal-email">{m.email}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

/**
 * ClubCard — Shared club card component.
 *
 * Props:
 *   club         {object}   Club object from the API (with populated members)
 *   index        {number}   For gradient fallback
 *   role         {string}   'admin' | 'student' | 'coordinator'
 *   userId       {string}   Current user _id (for student join/leave state)
 *   onJoin       {function} (clubId) => void — student action
 *   loading      {boolean}  Disable action button while in progress
 */
const ClubCard = ({
    club,
    index = 0,
    role = 'student',
    userId = '',
    onJoin,
    onDelete,
    onViewStudents,
    loading = false,
}) => {
    // Modal open/close — no inline expansion, grid never shifts
    const [membersOpen, setMembersOpen] = useState(false);

    const members = club.members || [];
    // Single source of truth: backend array length
    const memberCount = members.length;

    const isMember = userId && members.some(m => (m._id || m) === userId);

    const namedMembers = members.filter(m => m && m.name);
    const visibleAvatars = namedMembers.slice(0, 3);

    const renderAction = () => {
        if (role === 'admin') {
            return (
                <div className="ec-actions">
                    {onViewStudents && (
                        <button
                            className="ec-btn-view-reg"
                            onClick={() => onViewStudents({
                                label: `Members — ${club.name}`,
                                students: club.members,
                            })}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            {memberCount} Members
                        </button>
                    )}
                    {!onViewStudents && (
                        <button
                            className="ec-btn-view-reg"
                            onClick={() => setMembersOpen(true)}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            View Members
                        </button>
                    )}
                    <button
                        className="ec-btn ec-btn-delete"
                        title="Delete club"
                        onClick={() => onDelete?.(club._id, club.name)}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                    </button>
                </div>
            );
        }

        if (role === 'coordinator') {
            return (
                <div className="ec-actions">
                    <span className="ec-status-label ec-status-approved">✓ Managed Club</span>
                </div>
            );
        }

        // student
        return (
            <div className="ec-actions">
                <button
                    className={`ec-btn ${isMember ? 'ec-btn-unregister' : 'ec-btn-register'}`}
                    disabled={loading}
                    onClick={() => onJoin?.(club._id)}
                >
                    {isMember ? '✕ Leave' : 'Join Club'}
                </button>
            </div>
        );
    };

    return (
        <>
            <div className="ec-card">
                {/* Image Header */}
                <div className="ec-header">
                    {club.image ? (
                        <img src={club.image} alt={club.name} className="ec-header-img" />
                    ) : (
                        <div className="ec-header-gradient" style={{ background: getClubBg(club.name, index) }} />
                    )}
                    <div className="ec-overlay" />
                    
                    <div className="ec-type-tag" style={{ background: 'rgba(236, 72, 153, 0.82)' }}>
                        CLUB
                    </div>

                    <div className="ec-header-text">
                        <h3 className="ec-title">{club.name}</h3>
                    </div>
                </div>

                {/* Content Body */}
                <div className="ec-body">
                    <p className="ec-description">{club.description}</p>

                    {/* ── Creator Info (Admin · Pending only) ── */}
                    {role === 'admin' && club.status === 'pending' && club.coordinator && (
                        <div className="ec-creator-strip">
                            <div className="ec-creator-row">
                                <div className="ec-creator-avatar">
                                    {(club.coordinator.name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div className="ec-creator-info">
                                    <span className="ec-creator-name">
                                        {club.coordinator.name}
                                        {club.coordinator.regNumber && (
                                            <span className="ec-creator-reg"> · {club.coordinator.regNumber}</span>
                                        )}
                                    </span>
                                    <span className="ec-creator-meta">
                                        {[club.coordinator.course, club.coordinator.semester ? `Sem ${club.coordinator.semester}` : null, club.coordinator.section ? `Sec ${club.coordinator.section}` : null].filter(Boolean).join(' | ')}
                                    </span>
                                </div>
                            </div>
                            {club.createdAt && (
                                <span className="ec-creator-date">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    {new Date(club.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="ec-meta">
                        <span className="ec-meta-item">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {club.schedule || 'Weekly Meetups'}
                        </span>
                        
                        <span className="ec-meta-item">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {memberCount} members
                        </span>
                    </div>

                    {renderAction()}
                </div>
            </div>

            {/* Portal modal — rendered at document.body, zero effect on grid */}
            {membersOpen && (
                <MembersModal club={club} onClose={() => setMembersOpen(false)} />
            )}
        </>
    );
};

export default ClubCard;
