import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const { logout } = useAuth();
    const [events, setEvents] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const eventsRes = await axios.get('/api/events');
            const clubsRes = await axios.get('/api/clubs');
            const announcementsRes = await axios.get('/api/announcements');
            setEvents(eventsRes.data);
            setClubs(clubsRes.data);
            setAnnouncements(announcementsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Real-time polling (30s)
    useEffect(() => {
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const registerEvent = async (id) => {
        try {
            await axios.post(`/api/events/${id}/register`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('student_token')}` }
            });
            alert('Registered Successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error registering');
        }
    };

    const joinClub = async (id) => {
        try {
            await axios.post(`/api/clubs/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('student_token')}` }
            });
            alert('Joined Club Successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error joining');
        }
    };

    return (
        <div>
            <div className="dashboard-nav">
                <h2>Student Dashboard</h2>
                <button onClick={() => logout('student')}>Logout</button>
            </div>

            <div className="card">
                <h3>Announcements</h3>
                {announcements.map(ann => (
                    <div key={ann._id} className="item">
                        <h4>{ann.title}</h4>
                        <p>{ann.content}</p>
                        <hr />
                    </div>
                ))}
            </div>

            <div className="card">
                <h3>Events</h3>
                {events.filter(e => e.status === 'approved').map(event => (
                    <div key={event._id} className="item">
                        <h4>{event.title} ({new Date(event.date).toLocaleDateString()})</h4>
                        <p>{event.description}</p>
                        <p>Venue: {event.venue}</p>
                        <button onClick={() => registerEvent(event._id)}>Register</button>
                        <hr />
                    </div>
                ))}
            </div>

            <div className="card">
                <h3>Clubs</h3>
                {clubs.filter(c => c.status === 'approved').map(club => (
                    <div key={club._id} className="item">
                        <h4>{club.name}</h4>
                        <p>{club.description}</p>
                        <button onClick={() => joinClub(club._id)}>Join Club</button>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;
