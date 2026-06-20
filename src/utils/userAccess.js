import usersData from '../db/users.json';

const users = usersData.map((entry) => ({
  email: entry.email,
  isApproved: entry.isApproved,
  isAdmin: entry.isAdmin,
  blocked: entry.blocked,
}));

export function findUserByEmail(email) {
  return users.find((user) => user.email?.toLowerCase() === email?.toLowerCase());
}

export function userHasAccess(email) {
  const user = findUserByEmail(email);
  return Boolean(user && user.isApproved && !user.blocked);
}

export function isAdminUser(email) {
  const user = findUserByEmail(email);
  return Boolean(user && user.isAdmin && !user.blocked);
}

export function getAdminUsers() {
  return users;
}
