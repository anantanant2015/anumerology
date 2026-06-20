<template>
  <div class="admin-page">
    <section class="admin-guard" v-if="isLoading">
      <h2>Checking authentication...</h2>
    </section>

    <section class="admin-guard" v-else-if="!isAuthenticated">
      <h2>Admin access requires login</h2>
      <p>Please log in first and then navigate manually to <code>/admin</code>.</p>
      <button class="btn btn-primary" @click="login">Login</button>
    </section>

    <section class="admin-guard" v-else-if="isBlocked">
      <h2>Access denied</h2>
      <p>Your account is blocked and cannot access the admin panel.</p>
    </section>

    <section class="admin-guard" v-else-if="!isApproved">
      <h2>Approval required</h2>
      <p>Your account is not approved to access the admin page.</p>
    </section>

    <section class="admin-guard" v-else-if="!allowAdminPanel">
      <h2>Admin password required</h2>
      <p>This user is approved, but not tagged as admin in the user database.</p>
      <input
        type="password"
        v-model="adminPassword"
        placeholder="Enter admin password"
      />
      <button class="btn btn-primary" @click="validateAdminPassword">Submit</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </section>

    <div class="admin-panel" v-else>
      <aside class="side-nav">
        <button
          class="nav-item"
          :class="{ active: currentView === 'manage' }"
          @click="currentView = 'manage'"
        >
          Manage Users
        </button>
        <button
          class="nav-item"
          :class="{ active: currentView === 'settings' }"
          @click="currentView = 'settings'"
        >
          Settings
        </button>
      </aside>

      <section class="admin-content">
        <div v-if="currentView === 'manage'">
          <h2>Approved Users</h2>
          <div class="add-user-row">
            <input v-model="newEmail" type="email" placeholder="Add user email" />
            <button class="btn btn-primary" @click="addNewUser">Add user</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Approved</th>
                <th>Admin</th>
                <th>Blocked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in users" :key="item.email">
                <td>{{ item.email }}</td>
                <td>{{ item.isApproved }}</td>
                <td>{{ item.isAdmin }}</td>
                <td>{{ item.blocked }}</td>
                <td>
                  <button @click="toggleApprove(item.email)">Toggle Approve</button>
                  <button @click="toggleAdmin(item.email)">Toggle Admin</button>
                  <button @click="toggleBlock(item.email)">Toggle Block</button>
                  <button @click="deleteUser(item.email)">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="currentView === 'settings'">
          <h2>Admin Settings</h2>
          <p>
            The admin password comes from <code>VITE_ADMIN_PASSWORD</code>.
            Admin users do not have to re-enter this password.
          </p>
          <p>
            Approved users can access the calculator page. Non-admin approved users
            must still enter the admin password when visiting <code>/admin</code>.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import {
  getAllUsers,
  findUserByEmail,
  updateUser,
  removeUser,
  addUser,
  isAdminUser,
} from '../utils/userStore';

const { isLoading, isAuthenticated, loginWithRedirect, user } = useAuth0();
const users = ref(getAllUsers());
const currentView = ref('manage');
const adminPassword = ref('');
const errorMessage = ref('');
const adminValidated = ref(false);
const newEmail = ref('');

const currentUser = computed(() => findUserByEmail(user.value?.email));
const isBlocked = computed(() => currentUser.value?.blocked === true);
const isApproved = computed(() => currentUser.value?.isApproved === true);
const isAdmin = computed(() => currentUser.value?.isAdmin === true);
const allowAdminPanel = computed(() => isAdmin.value || adminValidated.value);

const storageKey = computed(() =>
  user.value?.email ? `admin-auth-${user.value.email.toLowerCase()}` : null
);

watchEffect(() => {
  if (storageKey.value) {
    adminValidated.value = window.sessionStorage.getItem(storageKey.value) === 'true';
  }
});

const login = () => loginWithRedirect();

const validateAdminPassword = () => {
  const password = import.meta.env.VITE_ADMIN_PASSWORD || '';
  if (!password) {
    errorMessage.value = 'Admin password is not configured.';
    return;
  }

  if (adminPassword.value !== password) {
    errorMessage.value = 'Incorrect password.';
    return;
  }

  if (storageKey.value) {
    window.sessionStorage.setItem(storageKey.value, 'true');
  }
  adminValidated.value = true;
  errorMessage.value = '';
};

const refreshUsers = () => {
  users.value = getAllUsers();
};

const toggleApprove = (email) => {
  const existing = findUserByEmail(email);
  if (!existing) return;
  updateUser(email, { isApproved: !existing.isApproved });
  refreshUsers();
};

const toggleAdmin = (email) => {
  const existing = findUserByEmail(email);
  if (!existing) return;
  updateUser(email, { isAdmin: !existing.isAdmin });
  refreshUsers();
};

const toggleBlock = (email) => {
  const existing = findUserByEmail(email);
  if (!existing) return;
  updateUser(email, { blocked: !existing.blocked });
  refreshUsers();
};

const deleteUser = (email) => {
  removeUser(email);
  refreshUsers();
};

const addNewUser = () => {
  const email = newEmail.value.trim().toLowerCase();
  if (!email) {
    errorMessage.value = 'Enter a valid email address.';
    return;
  }
  addUser(email);
  newEmail.value = '';
  errorMessage.value = '';
  refreshUsers();
};
</script>

<style scoped>
.admin-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.admin-guard {
  width: 100%;
  max-width: 720px;
  margin: 32px auto;
  background: #ffffff;
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.admin-guard input {
  width: 100%;
  max-width: 360px;
  margin: 16px auto;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
}

.admin-panel {
  display: flex;
  gap: 24px;
}

.side-nav {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  padding: 14px 18px;
  border: none;
  text-align: left;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.nav-item.active {
  background: #03a9f4;
  color: white;
}

.admin-content {
  flex: 1;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.add-user-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.add-user-row input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #eaeaea;
  padding: 12px 10px;
}

button {
  margin-right: 8px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #f3f3f3;
}

.btn {
  min-width: 120px;
  background: #03a9f4;
  color: #fff;
}

.error-message {
  margin-top: 12px;
  color: #d32f2f;
}
</style>
