const API_BASE_URL = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('authToken');
}

function setToken(token) {
  localStorage.setItem('authToken', token);
}

function clearToken() {
  localStorage.removeItem('authToken');
}

function getStoredUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

function setStoredUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

async function apiRequest(path, options) {
  const settings = options || {};
  const headers = settings.headers || {};

  if (settings.body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const response = await fetch(API_BASE_URL + path, {
    method: settings.method || 'GET',
    headers,
    body: settings.body ? JSON.stringify(settings.body) : undefined
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

function requireAuthOrRedirect() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
