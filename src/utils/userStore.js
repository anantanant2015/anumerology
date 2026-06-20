import defaultUsers from '../db/users.json';

const STORAGE_KEY = 'anumerology_user_db';

function getStoredUsers() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to load stored users', error);
    return null;
  }
}

function saveUsers(users) {
  if (typeof window === 'undefined') return users;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users', error);
  }
  return users;
}

export function getUsers() {
  const stored = getStoredUsers();
  return stored && Array.isArray(stored) ? stored : [...defaultUsers];
}

export function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.toLowerCase();
  return getUsers().find((user) => user.email.toLowerCase() === normalized) || null;
}

export function userHasAccess(email) {
  const user = findUserByEmail(email);
  return Boolean(user && user.isApproved && !user.blocked);
}

export function isAdminUser(email) {
  const user = findUserByEmail(email);
  return Boolean(user && user.isAdmin && !user.blocked);
}

export function getAllUsers() {
  return getUsers();
}

export function addUser(email) {
  const users = getUsers();
  const normalized = email.toLowerCase();
  if (!normalized || users.some((user) => user.email.toLowerCase() === normalized)) {
    return users;
  }

  const next = [
    ...users,
    {
      email: normalized,
      isApproved: false,
      isAdmin: false,
      blocked: false,
    },
  ];
  return saveUsers(next);
}

export function updateUser(email, updates) {
  const users = getUsers();
  const normalized = email?.toLowerCase();
  const next = users.map((user) =>
    user.email.toLowerCase() === normalized ? { ...user, ...updates } : user
  );
  return saveUsers(next);
}

export function removeUser(email) {
  const users = getUsers();
  const normalized = email?.toLowerCase();
  const next = users.filter((user) => user.email.toLowerCase() !== normalized);
  return saveUsers(next);
}
