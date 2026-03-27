import { v4 as uuidv4 } from 'uuid';
import {
  getUsers,
  getUserByUsername,
  saveUser,
  getSession as getStoredSession,
  setSession,
  clearSession,
} from './storage.js';

export function getSession() {
  return getStoredSession();
}

export function logout() {
  clearSession();
}

export function login(username, password) {
  try {
    if (!username || !password) {
      return { success: false, error: 'Username and password are required' };
    }

    const user = getUserByUsername(username);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid credentials' };
    }

    const session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    };

    const written = setSession(session);
    if (!written) {
      return { success: false, error: 'localStorage unavailable' };
    }

    return {
      success: true,
      session: getStoredSession(),
    };
  } catch {
    return { success: false, error: 'localStorage unavailable' };
  }
}

export function register(displayName, username, password, confirmPassword) {
  try {
    if (!displayName || !username || !password || !confirmPassword) {
      return { success: false, error: 'All fields are required' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    const existing = getUserByUsername(username);
    if (existing) {
      return { success: false, error: 'Username already exists' };
    }

    const newUser = {
      id: uuidv4(),
      username: username,
      displayName: displayName,
      password: password,
      role: 'viewer',
      createdAt: Date.now(),
    };

    const saved = saveUser(newUser);
    if (!saved) {
      return { success: false, error: 'localStorage unavailable' };
    }

    const session = {
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
      displayName: newUser.displayName,
    };

    const written = setSession(session);
    if (!written) {
      return { success: false, error: 'localStorage unavailable' };
    }

    return {
      success: true,
      session: getStoredSession(),
    };
  } catch {
    return { success: false, error: 'localStorage unavailable' };
  }
}