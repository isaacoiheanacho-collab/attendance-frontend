import { API_BASE } from './config.js';

const token = localStorage.getItem('token');

// Verify token validity before showing dashboard
async function checkToken() {
  if (!token) {
    window.location.href = 'index.html';
    return false;
  }
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Token invalid');
    return true;
  } catch (err) {
    console.error('Token verification failed:', err);
    localStorage.removeItem('token');
    window.location.href = 'index.html';
    return false;
  }
}

// Only set up dashboard functionality if token is valid
checkToken().then(isValid => {
  if (!isValid) return;

  // Search member
  document.getElementById('searchBtn').addEventListener('click', () => {
    let reg = document.getElementById('regNumber').value.trim();
    if (!reg) return alert('Enter registration number');
    reg = reg.toUpperCase();
    window.location.href = `member?reg=${encodeURIComponent(reg)}`;
  });

  // Logout with API call to clear session
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });
});