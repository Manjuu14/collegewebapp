/**
 * admin-login.js
 * Safely parses JSON from the login API and validates the admin role.
 */

async function safeJson(response) {
    const text = await response.text();
    if (!text || text.trim() === '') {
        throw new Error('Server returned an empty response. Is the backend running on port 5002?');
    }
    try {
        return JSON.parse(text);
    } catch {
        throw new Error('Server returned an invalid response. Check the backend logs.');
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.querySelector('.signin-btn');
    const original = btn.innerText;

    btn.innerText = 'Verifying...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await safeJson(response);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed. Please try again.');
        }

        if (data.role !== 'admin') {
            throw new Error('Access denied. Administrator privileges required.');
        }

        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data));

        window.location.href = '/admin';

    } catch (error) {
        alert(error.message);
        console.error('Admin login error:', error);
    } finally {
        btn.innerText = original;
        btn.style.opacity = '1';
        btn.disabled = false;
    }
});
