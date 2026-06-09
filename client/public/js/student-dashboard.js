document.addEventListener('DOMContentLoaded', async () => {
    console.log('Student Dashboard Script Loaded');
    // 1. Auth Check
    const token = localStorage.getItem('student_token');
    const userStr = localStorage.getItem('student_user');

    if (!token || !userStr) {
        window.location.href = '/student-login.html';
        return;
    }

    // ── Refresh user from backend to fix stale session data (e.g. "Admin User") ──
    try {
        const meRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meRes.ok) {
            const freshUser = await meRes.json();
            // Only trust if role is student
            if (freshUser.role === 'student' || freshUser.role === undefined) {
                const merged = { ...JSON.parse(userStr), ...freshUser };
                localStorage.setItem('student_user', JSON.stringify(merged));
            } else if (freshUser.role !== 'student') {
                // Wrong role in token — sign out and redirect
                localStorage.removeItem('student_token');
                localStorage.removeItem('student_user');
                window.location.href = '/student-login.html';
                return;
            }
        }
    } catch (e) {
        console.warn('Could not refresh session from server, using cached data:', e.message);
    }

    // Re-read potentially updated user
    const updatedUserStr = localStorage.getItem('student_user') || userStr;

    // --- Theme Initialization & Logic ---
    const savedTheme = localStorage.getItem('std-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeBtns = document.querySelectorAll('.theme-pill');
    themeBtns.forEach(btn => {
        if (btn.dataset.mode === savedTheme) btn.classList.add('active');
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            document.documentElement.setAttribute('data-theme', mode);
            localStorage.setItem('std-theme', mode);

            // Update UI
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 2. UI INITIALIZATION (Prioritize Interactivity)

    // --- Tab Switching Logic ---
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.tab-content');

    console.log('Tabs found:', tabs.length);

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default jump
            console.log('Tab clicked:', tab.dataset.tab);

            // Remove active class
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class
            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.error('Target section not found:', targetId);
            }
        });
    });

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout clicked');
            localStorage.removeItem('student_token');
            localStorage.removeItem('student_user');
            window.location.href = '/landing.html';
        });
    }

    // --- Refresh Data Logic ---
    const refreshBtn = document.getElementById('btnRefreshStudent');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (refreshBtn.disabled) return;
            refreshBtn.disabled = true;
            refreshBtn.classList.add('rotating');
            
            try {
                await fetchData();
            } catch (err) {
                console.error("Refresh failed:", err);
            } finally {
                // Keep the visual spin for at least 800ms for a better feel
                setTimeout(() => {
                    refreshBtn.classList.remove('rotating');
                    refreshBtn.disabled = false;
                }, 800);
            }
        });
    }

    // 3. Populate User Data (Profile Sync)
    // Wrapped in try-catch to prevent UI blocking on data error
    let user = {};
    try {
        user = JSON.parse(updatedUserStr);
        const currentUserEmail = user.email;

        // Merge session user with stored profile to capture latest updates
        const activeProfile = { ...user };

        // Header Info
        const displayName = activeProfile.name || 'Student';
        const nameEl = document.getElementById('headerUserName');
        if (nameEl) nameEl.innerText = displayName;

        const initialsEl = document.getElementById('userInitials');
        if (initialsEl) initialsEl.innerText = displayName.charAt(0).toUpperCase();

        const welcomeEl = document.getElementById('welcomeTitle');
        if (welcomeEl) welcomeEl.innerText = `Welcome back, ${displayName}!`;

        // Profile Form Fields
        const safeVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        safeVal('studentName', activeProfile.name);
        safeVal('profileEmail', activeProfile.email);
        safeVal('regNumber', activeProfile.regNumber);
        safeVal('semester', activeProfile.semester);
        safeVal('section', activeProfile.section);
        safeVal('course', activeProfile.course);

        // Load Profile Pic
        if (activeProfile.image) {
            const imgEl = document.getElementById('profilePreview');
            if (imgEl) imgEl.src = activeProfile.image;
        }

        // --- Profile Logic & Validation ---
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            const inputs = profileForm.querySelectorAll('input, select');
            const saveBtn = document.getElementById('saveProfileBtn');

            // Validation Patterns — regNumber optional (empty is valid until student fills it)
            const patterns = {
                studentName: /^[A-Za-z\s]+$/, // Alphabets and spaces
                regNumber: /^(\d{2}[A-Z]\d{5})?$/, // 23A12345 OR empty
                profileEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            };

            function validateField(field) {
                if (!patterns[field.id]) return true; // No pattern = valid

                const isValid = patterns[field.id].test(field.value);
                if (isValid) {
                    field.classList.add('valid');
                    field.classList.remove('invalid');
                } else {
                    field.classList.add('invalid');
                    field.classList.remove('valid');
                }
                return isValid;
            }

            function checkFormValidity() {
                if (!saveBtn) return;
                let isFormValid = true;
                // Check patterns
                ['studentName', 'profileEmail'].forEach(id => {
                    const field = document.getElementById(id);
                    if (field && field.value && !validateField(field)) isFormValid = false;
                });
                // regNumber: only validate if filled
                const regField = document.getElementById('regNumber');
                if (regField && regField.value && !validateField(regField)) isFormValid = false;

                saveBtn.disabled = !isFormValid;
            }

            // Input Listeners
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    if (input.type !== 'password' && input.type !== 'file') {
                        validateField(input);
                    }
                    checkFormValidity();
                });
                input.addEventListener('change', checkFormValidity);
            });

            // Initial Check
            checkFormValidity();

            // Password Toggle
            const togglePass = document.querySelector('.toggle-password');
            if (togglePass) {
                togglePass.addEventListener('click', function () {
                    const passInfo = document.getElementById('profilePassword');
                    const type = passInfo.getAttribute('type') === 'password' ? 'text' : 'password';
                    passInfo.setAttribute('type', type);
                    this.style.color = type === 'text' ? 'var(--primary)' : 'var(--text-muted)';
                });
            }

            // Profile Image Upload Listener
            const profileUpload = document.getElementById('profileUpload');
            const profilePreview = document.getElementById('profilePreview');
            let profileImageData = null;

            if (profileUpload) {
                profileUpload.addEventListener('change', function (e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (event) {
                            if (profilePreview) profilePreview.src = event.target.result;
                            profileImageData = event.target.result;
                            checkFormValidity();
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Save Logic
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!saveBtn) return;
                saveBtn.innerText = 'Saving...';
                saveBtn.disabled = true;

                // 1. Gather Data
                const newData = {
                    name: document.getElementById('studentName').value,
                    regNumber: document.getElementById('regNumber').value,
                    semester: document.getElementById('semester').value,
                    section: document.getElementById('section').value,
                    course: document.getElementById('course').value,
                    image: profileImageData || (profilePreview ? profilePreview.src : null)
                };

                // Password
                const newPass = document.getElementById('profilePassword').value;
                if (newPass) newData.password = newPass;

                try {
                    const res = await fetch('/api/auth/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(newData)
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Update failed');

                    // Capture updated user object from response
                    const updatedUser = { ...user, ...data };
                    localStorage.setItem('student_user', JSON.stringify(updatedUser));
                    if (data.token) localStorage.setItem('student_token', data.token);

                    const successMsg = document.getElementById('saveSuccessMsg');
                    setTimeout(() => {
                        saveBtn.innerText = 'Save Changes';
                        saveBtn.disabled = false;
                        if (successMsg) successMsg.style.display = 'inline';

                        // Update UI globally
                        if (document.getElementById('navUserName')) document.getElementById('navUserName').innerText = data.name;
                        if (document.getElementById('headerUserName')) document.getElementById('headerUserName').innerText = data.name;
                        if (document.getElementById('welcomeTitle')) document.getElementById('welcomeTitle').innerText = `Welcome back, ${data.name}!`;

                        document.getElementById('profilePassword').value = '';
                        setTimeout(() => { if (successMsg) successMsg.style.display = 'none'; }, 3000);
                    }, 800);

                } catch (error) {
                    console.error('Profile update error:', error);
                    alert('Error updating profile: ' + error.message);
                    saveBtn.innerText = 'Save Changes';
                    saveBtn.disabled = false;
                }
            });
        }
    } catch (err) {
        console.error("Profile Sync Error (Non-Fatal):", err);
    }

    // ── UNIFIED SEARCH SETUP ────────────────────────────────────────
    function wireSearch(inputId, clearBtnId, getCards, getText) {
        const input   = document.getElementById(inputId);
        const clearBtn = document.getElementById(clearBtnId);
        if (!input) return;

        function applyFilter() {
            const term = input.value.trim().toLowerCase();
            clearBtn.style.display = term ? 'flex' : 'none';
            getCards().forEach(card => {
                const haystack = getText(card).toLowerCase();
                card.style.display = haystack.includes(term) ? '' : 'none';
            });
        }

        input.addEventListener('input', applyFilter);

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            getCards().forEach(card => card.style.display = '');
            input.focus();
        });
    }

    // Events search — searches title + description + venue
    wireSearch(
        'eventSearchInput',
        'eventSearchClear',
        () => document.querySelectorAll('#eventsList .event-card-pro'),
        card => [
            card.querySelector('.ev-title-overlay')?.textContent || '',
            card.querySelector('.ev-desc-text')?.textContent    || '',
            card.querySelector('.ev-location-sm')?.textContent  || ''
        ].join(' ')
    );

    // Clubs search — searches name + description
    wireSearch(
        'clubSearchInput',
        'clubSearchClear',
        () => document.querySelectorAll('#clubsGrid .club-card-pro'),
        card => [
            card.querySelector('.club-title-lg')?.textContent || '',
            card.querySelector('.club-desc-sm')?.textContent  || ''
        ].join(' ')
    );

    // 5. Fetch Data (Announcements, Events, Clubs)
    console.log('Fetching initial data...');
    fetchData();

    async function fetchData() {
        const headers = { 'Authorization': `Bearer ${token}` };

        console.log('Starting parallel data fetch...');

        const [newsResult, eventsResult, clubsResult] = await Promise.allSettled([
            fetch('/api/announcements', { headers }).then(r => r.json()),
            fetch('/api/events', { headers }).then(r => r.json()),
            fetch('/api/clubs', { headers }).then(r => r.json())
        ]);

        // 1. Handle News
        if (newsResult.status === 'fulfilled') {
            renderNews(newsResult.value);
        } else {
            console.error('News fetch failed:', newsResult.reason);
            // Optional: renderMockNews()
        }

        // 2. Handle Events (Critical Fallback)
        if (eventsResult.status === 'fulfilled' && eventsResult.value && eventsResult.value.length > 0) {
            renderEvents(eventsResult.value, user._id);
        } else {
            console.warn('Events fetch failed or empty. Using MOCK data.');
            renderEvents(getMockEvents(user._id), user._id);
        }

        // 3. Handle Clubs
        if (clubsResult.status === 'fulfilled' && clubsResult.value && clubsResult.value.length > 0) {
            renderClubs(clubsResult.value, user._id);
        } else {
            console.warn('Clubs fetch failed or empty. Using MOCK data.');
            renderClubs(getMockClubs(user._id), user._id);
        }
    }

    // --- MOCK DATA GENERATOR ---
    function getMockEvents(userId) {
        return [
            {
                _id: 'mock-1',
                title: 'Annual Hackathon',
                description: '24-hour coding marathon. Build the future.',
                venue: 'Presidency College',
                date: '2026-02-26T09:00:00',
                attendees: ['mock-user-1', 'mock-user-2', 'mock-user-3', ...Array(19).fill('id')], // 22 registered
                status: 'approved'
            },
            {
                _id: 'mock-2',
                title: 'Graduation Party',
                description: 'Celebrating the class of 2026. A night to remember.',
                venue: 'Presidency College',
                date: '2026-05-10T18:00:00',
                attendees: [...Array(40).fill('id')], // 40 registered
                status: 'approved'
            },
            {
                _id: 'mock-3',
                title: 'Gaming Tournament',
                description: 'Inter-department e-sports championship (Valorant & FIFA).',
                venue: 'Presidency College',
                date: '2026-03-02T10:00:00',
                attendees: [...Array(20).fill('id')], // 20 registered
                status: 'approved'
            }
        ];
    }

    function getMockClubs(userId) {
        return [
            { _id: 'mock-c1', name: 'Tech Innovators', description: 'Lead the coding revolution with hackathons.', members: [...Array(30).fill('id')], schedule: 'Fridays, 4 PM' },
            { _id: 'mock-c2', name: 'Debate Society', description: 'Discussing new policies and world events.', members: [...Array(45).fill('id')], schedule: 'Mondays, 5 PM' },
            { _id: 'mock-c3', name: 'Fitness Club', description: 'Yoga, gym sessions, and diet plans for everyone.', members: [...Array(62).fill('id')], schedule: 'Daily, 6 AM' },
            { _id: 'mock-c4', name: 'Wildlife & Geo', description: 'A club for biology, ecology and field trips.', members: [...Array(30).fill('id')], schedule: 'Weekends' },
            { _id: 'mock-c5', name: 'DJ Club', description: 'Learn mixing, mastering and prestige of voltage.', members: [...Array(15).fill('id')], schedule: 'Saturdays, 7 PM' },
            { _id: 'mock-c6', name: 'Music Club', description: 'Create live sessions and record tracks.', members: [...Array(60).fill('id')], schedule: 'Wednesdays, 5 PM' },
            { _id: 'mock-c7', name: 'Web Dev', description: 'Workshop on HTML, CSS, React and database.', members: [...Array(20).fill('id')], schedule: 'Thursdays, 3 PM' },
            { _id: 'mock-c8', name: 'Gardening Club', description: 'Create beautiful gardens and learn botany.', members: [...Array(25).fill('id')], schedule: 'Sundays' },
            { _id: 'mock-c9', name: 'Badminton Club', description: 'Daily matches and competitive tournaments.', members: [...Array(50).fill('id')], schedule: 'Daily, 5 PM' },
            { _id: 'mock-c10', name: 'Trekking Club', description: 'Monthly trips to nearby hills and valleys.', members: [...Array(40).fill('id')], schedule: 'First Saturday' },
            { _id: 'mock-c11', name: 'Dance Club', description: 'Hip hop, classical, and contemporary dance.', members: [...Array(55).fill('id')], schedule: 'Tu/Thu, 6 PM' },
            { _id: 'mock-c12', name: 'Drawing Club', description: 'Sketching, painting and digital art for hobbyists.', members: [...Array(35).fill('id')], schedule: 'Fridays, 2 PM' }
        ];
    }

    // Render Functions
    // 1. News Render (Dashboard + Full Tab)
    function renderNews(news) {
        const mockNews = [
            { id: 'n1', title: 'Holiday Notice: Shiva Ratri', desc: '15th Feb will be holiday due to Shiva Ratri festival.', date: '2/15/2026', type: 'news' },
            { id: 'n2', title: 'Midterm Exam Schedule', desc: 'Midterm theory exam will commence on 17th Feb Monday.', date: '2/17/2026', type: 'announcement' },
            { id: 'n3', title: 'Practical Exams', desc: 'Midterm practicals will start on 5th Feb Thursday.', date: '2/5/2026', type: 'announcement' }
        ];

        // Normalize real API items — include type for badge differentiation
        const normalizeApiItem = (item) => {
            const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            return {
                id: item._id,
                title: item.title,
                desc: item.content,
                date: formattedDate,
                type: item.type || 'announcement'
            };
        };

        const displayNews = (news && news.length > 0)
            ? news.map(normalizeApiItem)
            : []; // No fallback to mockNews anymore

        // Dashboard Mini View (Limit 3)
        const dashboardContainer = document.getElementById('newsGrid');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = displayNews.slice(0, 3).map(item => createPremiumNewsCard(item)).join('');
        }

        // Full News Tab Container
        const fullContainer = document.getElementById('fullNewsGrid');
        if (fullContainer) {
            fullContainer.innerHTML = displayNews.map(item => createPremiumNewsCard(item)).join('');
        }
    }

    function createPremiumNewsCard(item) {
        const isAnn = !item.type || item.type === 'announcement';
        const badgeHtml = isAnn
            ? `<div class="official-pill official-pill-ann">⚠ IMPORTANT</div>`
            : `<div class="official-pill official-pill-news">NEWS</div>`;
        const borderStyle = isAnn
            ? 'border-left: 4px solid #ef4444; background: #fffbfb;'
            : 'border-left: 3px solid #60a5fa; background: #fff;';
        return `
        <div class="news-card-pro" style="${borderStyle}">
            <div class="news-watermark">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
            </div>
            
            <div class="news-header-row">
                ${badgeHtml}
                <div class="news-date-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.7">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${item.date}</span>
                </div>
            </div>

            <h3 class="news-title-lg" style="${isAnn ? 'font-weight:800;' : ''}">${item.title}</h3>
            <p class="news-desc-md">${item.desc}</p>
        </div>
        `;
    }


    function createNewsCard(item, isOfficialStyle = true) {
        const dateObj = new Date(item.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Use the Official Card style from the request
        return `
        <div class="news-card-official">
            <div class="news-card-header">
                <div class="official-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>OFFICIAL ANNOUNCEMENT</span>
                </div>
                <span class="news-date-sm">${dateStr}</span>
            </div>
            
            <h3 class="news-title-lg">${item.title}</h3>
            <p class="news-body">${item.content}</p>

            <svg class="watermark-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
            </svg>
        </div>
        `;
    }

    function renderEvents(events, userId) {
        const container = document.getElementById('eventsList');
        if (!container) return;

        const approvedEvents = events.filter(e => e.status === 'approved');

        if (approvedEvents.length === 0) {
            container.innerHTML = '<p style="color:#64748b">No upcoming events found.</p>';
            return;
        }

        // Map images by event title (works for both real API and mock events)
        const eventImages = {
            'annual hackathon': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop',
            'graduation party': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop',
            'gaming tournament': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
        };

        const gradients = [
            'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            'linear-gradient(135deg, #4c1d95, #8b5cf6)',
            'linear-gradient(135deg, #0f766e, #14b8a6)',
            'linear-gradient(135deg, #be185d, #ec4899)'
        ];

        container.innerHTML = approvedEvents.map((event, index) => {
            // Support both populated objects {_id, name} and plain string IDs
            const isRegistered = (event.attendees || []).some(a => {
                const attendeeId = typeof a === 'object' ? (a._id || '').toString() : a.toString();
                return attendeeId === userId.toString();
            });

            const dateObj = new Date(event.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
            const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const count = event.attendees.length;

            // Look up image by lowercase title — matches real API and mock events
            const titleKey = event.title.toLowerCase();
            const bgImage = event.image || eventImages[titleKey];
            const bgStyle = bgImage ? `background-image: url('${bgImage}'); background-size: cover; background-position: center;` : `background: ${gradients[index % gradients.length]}`;

            return `
            <div class="event-card-pro theme-ref-design">
                <div class="event-image-header" style="${bgStyle}">
                    <div class="event-overlay-dark"></div>
                    
                    <div class="event-date-badge-glass">
                        <span class="ev-month">${month}</span>
                        <span class="ev-day">${day}</span>
                    </div>

                    <div class="event-type-pill">EVENT</div>

                    <div class="event-text-overlay">
                        <div class="ev-location-sm">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${event.venue.toUpperCase()}
                        </div>
                        <h3 class="ev-title-overlay">${event.title}</h3>
                    </div>
                </div>

                <div class="event-body-content">
                    <p class="ev-desc-text">${event.description}</p>
                    
                    <div class="ev-meta-line">
                        <div class="ev-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${time}
                        </div>
                        <div class="ev-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span id="count-${event._id}">${count} Registered</span>
                        </div>
                    </div>

                    <button class="btn-event-full ${isRegistered ? 'state-registered' : 'state-register'}" 
                            onclick="registerEvent('${event._id}', this)">
                        ${isRegistered ? '✓ Registered' : 'Register Now'}
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    function renderClubs(clubs, userId) {
        const container = document.getElementById('clubsGrid');
        if (!container) return;

        // ── Club images: SAME source as ClubCard.jsx (centralized clubImages.js) ──
        const clubImages = {
            'Tech Innovators': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=900&auto=format&fit=crop',
            'Debate Society': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=900&auto=format&fit=crop',
            'Fitness Club': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop',
            'Music Club': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=900&auto=format&fit=crop',
            'Web Dev Club': 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=900&auto=format&fit=crop',
            'Dance Club': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=900&auto=format&fit=crop',
            'DJ Club': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=900&auto=format&fit=crop',
            'Wildlife & Geo': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=900&auto=format&fit=crop',
            'Gardening Club': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=900&auto=format&fit=crop',
            'Badminton Club': 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=900&auto=format&fit=crop',
            'Trekking Club': 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=900&auto=format&fit=crop',
            'Drawing Club': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=900&auto=format&fit=crop',
        };

        const gradients = [
            'linear-gradient(135deg, #dbeafe, #93c5fd)',
            'linear-gradient(135deg, #fce7f3, #f9a8d4)',
            'linear-gradient(135deg, #d1fae5, #6ee7b7)',
            'linear-gradient(135deg, #fef3c7, #fcd34d)',
            'linear-gradient(135deg, #ede9fe, #c4b5fd)',
            'linear-gradient(135deg, #ffedd5, #fdba74)',
        ];

        container.innerHTML = clubs.map((club, index) => {
            // Support both populated objects {_id, name} and plain string IDs
            const isMember = (club.members || []).some(m => {
                const memberId = typeof m === 'object' ? (m._id || '').toString() : m.toString();
                return memberId === userId.toString();
            });

            // Resolve Image
            let bgStyle = '';
            const bgImage = club.image || clubImages[club.name];
            if (bgImage) {
                bgStyle = `background-image: url('${bgImage}'); background-size: cover; background-position: center;`;
            } else {
                bgStyle = `background: ${gradients[index % gradients.length]}`;
            }

            return `
            <div class="club-card-pro theme-ref-design">
                <div class="club-image-header" style="${bgStyle}">
                    <div class="club-overlay-dark-soft"></div>
                </div>
                
                <div class="club-content-body">
                    <h3 class="club-title-lg">${club.name}</h3>
                    
                    <div class="club-meta-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${club.schedule || 'Weekly Meetups'}
                    </div>

                    <p class="club-desc-sm">${club.description}</p>
                    
                    <div class="club-footer-action">
                        <div class="club-members-preview">
                            <div class="member-avatars">
                                <div class="avatar-circle"></div>
                                <div class="avatar-circle"></div>
                                <div class="avatar-circle"></div>
                            </div>
                            <span>${(club.members || []).length} Members</span>
                        </div>

                        <button class="btn-club-action ${isMember ? 'state-joined' : 'state-join'}" 
                                onclick="joinClub('${club._id}', this)">
                            ${isMember ? '✓ Joined' : 'Join Club'}
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }


    // Global Action Functions
    window.registerEvent = async (id, btn) => {
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        if (id.startsWith('mock-')) {
            alert('Cannot register for mock events.');
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        try {
            // Backend natively acts as a toggle for registration on POST
            const res = await fetch(`/api/events/${id}/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                // Fetch latest data to ensure absolute sync with backend (counts & states)
                await fetchData();
            } else {
                const data = await res.json();
                alert(data.message || 'Action failed.');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        } catch (err) {
            console.error('Error during register:', err);
            alert('Network error. Please try again.');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };


    window.joinClub = async (id, btn) => {
        const isLeaving = btn.classList.contains('state-joined') || btn.classList.contains('state-leave');
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        if (id.startsWith('mock-')) {
            alert('Cannot join mock clubs.');
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        try {
            const endpoint = isLeaving ? `/api/clubs/${id}/leave` : `/api/clubs/${id}/join`;
            const method = isLeaving ? 'DELETE' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                // Fetch latest data to ensure absolute sync with backend
                await fetchData();
            } else {
                const data = await res.json();
                alert(data.message || 'Action failed');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        } catch (e) {
            console.error('Club join/leave error:', e);
            alert('Network error. Please try again.');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };



});
