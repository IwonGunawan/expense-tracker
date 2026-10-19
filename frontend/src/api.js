import { tr } from './i18n';

const TOKEN_KEY = 'expense_token';
const USER_KEY = 'expense_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}
export function setUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(tr('api.networkError'));
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && path !== '/auth/login') {
    clearToken();
    clearUser();
    window.location.href = '/login';
    throw new Error(data.message || tr('api.sessionExpired'));
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || tr(`api.status.${res.status}`);
    throw new Error(msg);
  }
  return data;
}