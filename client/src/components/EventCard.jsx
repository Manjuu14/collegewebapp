import React from 'react';
import { getEventBackground, fmtDate } from '../utils/eventImages';
import './EventCard.css';

/**
 * EventCard — Shared event card component used across Admin, Coordinator, and Student dashboards.
 *
 * Props:
 *   event       {object}   - The event object from the API
 *   index       {number}   - Used for gradient fallback color
 *   role        {string}   - 'admin' | 'coordinator' | 'student'
 *   userId      {string}   - Current user's _id (for determining registration state)
 *   onRegister  {function} - (eventId) => void  — student action
 *   onApprove   {function} - (eventId) => void  — admin action
 *   onReject    {function} - (eventId) => void  — admin action
 *   loading     {boolean}  - Disable buttons while action is in progress
 */
const EventCard = ({
    event,
    index = 0,
    role = 'student',
    userId = '',
    onRegister,
    onApprove,
    onReject,
    onDelete,
    onViewStudents,
    loading = false,
}) => {
    const { day, month, time, full } = fmtDate(event.date);
    const fallbackBg = getEventBackground(event.title, index);
    const bg = event.image ? `url('${event.image}') center/cover no-repeat` : fallbackBg;
    
    // Single source of truth: backend array length
    const attendeeCount = (event.attendees || []).length;

    const isRegistered = userId && (event.attendees || []).some(
        a => (a._id || a) === userId
    );

    // ── Status pill ───────────────────────────────────────────────────────────
    const statusMap = {
        approved: { label: '✓ Approved', cls: 'ec-status-approved' },
        pending: { label: '⏳ Pending', cls: 'ec-status-pending' },
        rejected: { label: '✕ Rejected', cls: 'ec-status-rejected' },
    };
    const statusInfo = statusMap[event.status] || statusMap.pending;

    // ── Role-based action button(s) ───────────────────────────────────────────
    const renderActions = () => {
        if (role === 'admin') {
            return (
                <div className="ec-actions">
                    {event.status === 'pending' && (
                        <>
                            <button className="ec-btn ec-btn-approve" disabled={loading} onClick={() => onApprove?.(event._id)}>
                                ✓ Approve
                            </button>
                            <button className="ec-btn ec-btn-reject" disabled={loading} onClick={() => onReject?.(event._id)}>
                                ✕ Reject
                            </button>
                        </>
                    )}
                    {event.status !== 'pending' && (
                        <span className={`ec-status-label ${statusInfo.cls}`}>{statusInfo.label}</span>
                    )}
                    {event.status === 'approved' && onViewStudents && (() => {
                        const url = `/api/events/${event._id}/registrations`;
                        return (
                            <button
                                className="ec-btn-view-reg"
                                onClick={() => onViewStudents({ label: `Registrations — ${event.title}`, students: event.attendees })}
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                {attendeeCount} Registered
                            </button>
                        );
                    })()}
                    {/* Delete — always visible for admin */}
                    <button
                        className="ec-btn ec-btn-delete"
                        title="Delete event"
                        onClick={() => onDelete?.(event._id, event.title)}
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
                    <span className={`ec-status-label ${statusInfo.cls}`}>{statusInfo.label}</span>
                    <span className="ec-attendee-count">{attendeeCount} registered</span>
                </div>
            );
        }

        // student
        const canRegister = event.status === 'approved';
        return (
            <div className="ec-actions">
                <button
                    className={`ec-btn ${isRegistered ? 'ec-btn-unregister' : 'ec-btn-register'}`}
                    disabled={loading || !canRegister}
                    onClick={() => onRegister?.(event._id)}
                >
                    {isRegistered ? '✓ Registered' : 'Register'}
                </button>
                <span className="ec-attendee-count">{attendeeCount} going</span>
            </div>
        );
    };

    return (
        <div className="ec-card">

            {/* ── Image / Gradient Header ── */}
            <div className="ec-header">
                {event.image ? (
                    <img src={event.image} alt={event.title} className="ec-header-img" />
                ) : (
                    <div className="ec-header-gradient" style={{ background: fallbackBg }} />
                )}
                <div className="ec-overlay" />

                {/* Date Badge */}
                <div className="ec-date-badge">
                    <span className="ec-month">{month}</span>
                    <span className="ec-day">{day}</span>
                </div>

                {/* Event Type Tag */}
                <div className="ec-type-tag">EVENT</div>

                {/* Title + Location */}
                <div className="ec-header-text">
                    <div className="ec-location">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {(event.venue || event.location || '').toUpperCase()}
                    </div>
                    <h3 className="ec-title">{event.title}</h3>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="ec-body">
                <p className="ec-description">{event.description}</p>

                {/* ── Creator Info (Admin · Pending only) ── */}
                {role === 'admin' && event.status === 'pending' && event.createdBy && (
                    <div className="ec-creator-strip">
                        <div className="ec-creator-row">
                            <div className="ec-creator-avatar">
                                {(event.createdBy.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div className="ec-creator-info">
                                <span className="ec-creator-name">
                                    {event.createdBy.name}
                                    {event.createdBy.regNumber && (
                                        <span className="ec-creator-reg"> · {event.createdBy.regNumber}</span>
                                    )}
                                </span>
                                <span className="ec-creator-meta">
                                    {[event.createdBy.course, event.createdBy.semester ? `Sem ${event.createdBy.semester}` : null, event.createdBy.section ? `Sec ${event.createdBy.section}` : null].filter(Boolean).join(' | ')}
                                </span>
                            </div>
                        </div>
                        {event.createdAt && (
                            <span className="ec-creator-date">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {new Date(event.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                )}

                <div className="ec-meta">
                    <span className="ec-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {time}
                    </span>
                    <span className="ec-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {attendeeCount} attending
                    </span>
                </div>

                {renderActions()}
            </div>
        </div>
    );
};

export default EventCard;
