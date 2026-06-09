/**
 * Auth Utils - LocalStorage based Authentication
 * Handles seeding, login verification, and profile updates.
 */

const STORAGE_KEY = 'college_app_users';

// Default Users for Seeding
const DEFAULT_USERS = [
    {
        email: 'manju@gmail.com',
        password: '123', // Default simple password
        role: 'student',
        name: 'Manju',
        regNumber: '23A12345',
        semester: '6',
        section: 'A',
        course: 'BCA',
        image: ''
    },
    {
        email: 'admin@gmail.com',
        password: '123',
        role: 'admin',
        name: 'Administrator'
    },
    {
        email: 'club@gmail.com',
        password: '123',
        role: 'coordinator',
        name: 'Club Coordinator'
    }
];

// Initialize Storage with Defaults if empty
function initializeAuth() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        console.log('Auth System: Default users seeded.');
    }
}

// Authenticate User
function loginUser(email, password, role) {
    initializeAuth(); // Ensure data exists
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY));

    const user = users.find(u => u.email === email && u.role === role);

    if (!user) {
        return { success: false, message: 'User not found or incorrect role.' };
    }

    if (user.password !== password) {
        return { success: false, message: 'Invalid credentials.' };
    }

    return { success: true, user: user };
}

// Update User Profile (Password etc)
function updateUserProfile(email, newDetails) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const index = users.findIndex(u => u.email === email);

    if (index !== -1) {
        // Merge existing user with new details
        users[index] = { ...users[index], ...newDetails };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

        // Also update the session if it's the current user
        const sessionUser = JSON.parse(localStorage.getItem('user'));
        if (sessionUser && sessionUser.email === email) {
            const updatedSession = { ...sessionUser, ...newDetails };
            localStorage.setItem('user', JSON.stringify(updatedSession));

            // Also update studentProfile specifically if used separately
            if (users[index].role === 'student') {
                localStorage.setItem('studentProfile', JSON.stringify(users[index]));
            }
        }
        return true;
    }
    return false;
}

// Get Current User Data
function getUserByEmail(email) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return users.find(u => u.email === email);
}

// Auto-run init
initializeAuth();
