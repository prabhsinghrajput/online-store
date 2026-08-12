const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Bumped on every sign-out. Used to discard stale getSession() responses
// that were already in flight when the user logged out, so a late response
// can never re-save a session that was just cleared.
let sessionEpoch = 0;

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const saveSession = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
};

export const clearSession = () => {
  sessionEpoch += 1;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  notifyAuthChange();
};

/**
 * Notify listeners (App) that auth state may have changed.
 */
const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth:changed'));
};

/**
 * Get current session, validating the stored token against the server.
 * Mirrors the old supabase.auth.getSession() return shape.
 */
export const getSession = async () => {
  const token = getToken();
  if (!token) {
    return { data: { session: null }, error: null };
  }

  const epoch = sessionEpoch;

  try {
    const res = await fetch(`${API_BASE}/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        // Discard stale responses if a logout happened while the request
        // was in flight (or the stored token changed) so we never revive a
        // cleared session.
        if (sessionEpoch !== epoch || getToken() !== token) {
          return { data: { session: null }, error: null };
        }
        // Refresh the stored user silently. Deliberately NOT saveSession():
        // saveSession fires auth:changed, which triggers getSession again,
        // which would create an endless re-validation loop.
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { data: { session: { access_token: token, user: data.user } }, error: null };
      }
    }

    if (sessionEpoch === epoch) {
      clearSession();
    }
    return { data: { session: null }, error: null };
  } catch {
    // Network error - fall back to stored user so the app stays usable offline
    const user = getStoredUser();
    return user
      ? { data: { session: { access_token: token, user } }, error: null }
      : { data: { session: null }, error: null };
  }
};

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  saveSession(data.token, data.user);
  return data;
};

export const register = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  saveSession(data.token, data.user);
  return data;
};

export const signOut = async () => {
  const token = getToken();
  if (token) {
    // Invalidate the token server-side (bumps the user's token_version) so a
    // leaked token stops working immediately. Fire-and-forget: even if this
    // fails the local session is still cleared.
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearSession();
};
