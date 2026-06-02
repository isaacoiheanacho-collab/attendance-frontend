import { API_BASE } from './config.js';

const token = localStorage.getItem('token');
if (!token) {
  alert('No token found. Please login again.');
  window.location.href = 'index.html';
}

// Extract registration number from URL (without .html extension)
const urlParams = new URLSearchParams(window.location.search);
const regNumber = urlParams.get('reg');

// ✅ Fallback: if regNumber is missing, go back to dashboard
if (!regNumber) {
  alert('No registration number provided. Returning to dashboard.');
  window.location.href = 'dashboard.html';
}

console.log('API_BASE:', API_BASE);
console.log('regNumber from URL:', regNumber);

let memberId = null;

async function loadMember() {
  try {
    const url = `${API_BASE}/members/${regNumber}`;
    console.log('Fetching:', url);
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Response status:', res.status);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(errorData.message || 'Failed to load member');
    }
    const member = await res.json();
    memberId = member.id;
    document.getElementById('memberName').textContent = member.full_name;
    document.getElementById('memberReg').textContent = member.reg_number;
    document.getElementById('joinedDate').textContent = `Joined: ${new Date(member.created_at).toLocaleDateString()}`;
    const img = document.getElementById('profilePhoto');
    if (member.profile_photo_url) {
      img.src = member.profile_photo_url;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
    window.location.href = 'dashboard.html';
  }
}

const photoInput = document.getElementById('photoInput');
const uploadBtn = document.getElementById('uploadBtn');

photoInput.addEventListener('change', () => {
  uploadBtn.disabled = !photoInput.files.length;
});

uploadBtn.addEventListener('click', async () => {
  const file = photoInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('photo', file);
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';
  try {
    const res = await fetch(`${API_BASE}/members/${memberId}/photo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errData.message);
    }
    alert('Photo uploaded!');
    await loadMember(); // refresh
  } catch (err) {
    alert(err.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload';
    photoInput.value = '';
  }
});

document.getElementById('confirmBtn').addEventListener('click', async () => {
  try {
    const device_id = navigator.userAgent || 'unknown-device';
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        member_id: memberId,
        device_id: device_id,
        photo_verified: true
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: 'Failed to mark attendance' }));
      throw new Error(errData.message);
    }
    window.location.href = 'success.html';
  } catch (err) {
    alert(err.message);
  }
});

loadMember();