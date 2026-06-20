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
                <td class="actions-cell">
                  <ActionMenu :open="openMenu === item.email" :items="getMenuItems(item.email)" @close="openMenu = null">
                    <template #toggle>
                      <button class="menu-toggle" @click.stop="toggleMenu(item.email)">⋮</button>
                    </template>
                  </ActionMenu>
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
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import {
  getAllUsers,
  findUserByEmail,
  updateUser,
  removeUser,
  addUser,
  isAdminUser,
} from '../utils/userStore';
import ActionMenu from '../components/ActionMenu.vue';



const { isLoading, isAuthenticated, loginWithRedirect, user } = useAuth0();
const users = ref(getAllUsers());
const currentView = ref('manage');
const adminPassword = ref('');
const errorMessage = ref('');
const adminValidated = ref(false);
const newEmail = ref('');
const openMenu = ref(null);

const toggleMenu = (email) => {
  openMenu.value = openMenu.value === email ? null : email;
};

const handleApprove = (email) => {
  toggleApprove(email);
  openMenu.value = null;
};

const handleAdmin = (email) => {
  toggleAdmin(email);
  openMenu.value = null;
};

const handleBlock = (email) => {
  toggleBlock(email);
  openMenu.value = null;
};

const handleRemove = (email) => {
  deleteUser(email);
  openMenu.value = null;
};

const getMenuItems = (email) => [
  { label: 'Toggle Approve', onClick: () => { toggleApprove(email); } },
  { label: 'Toggle Admin', onClick: () => { toggleAdmin(email); } },
  { label: 'Toggle Block', onClick: () => { toggleBlock(email); } },
  { label: 'Remove', onClick: () => { deleteUser(email); }, danger: true },
];

const onDocClick = () => { openMenu.value = null; };

onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));

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
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.admin-guard {
  width: 100%;
  max-width: 740px;
  margin: 32px auto;
  background: var(--surface);
  padding: 24px;
  border-radius: var(--card-radius);
  box-shadow: var(--elevation-2);
  text-align: center;
}

.admin-guard input {
  width: 100%;
  max-width: 360px;
  margin: 16px auto;
  padding: 12px 14px;
  border-radius: var(--small-radius);
  border: 1px solid var(--muted-border);
}

.admin-panel {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 740px;
}

.side-nav {
  position: sticky;
  top: 120px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  padding: 14px 18px;
  border: none;
  text-align: left;
  background: var(--surface);
  border-radius: var(--control-radius);
  cursor: pointer;
  box-shadow: var(--elevation-1);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

.admin-content {
  width: 100%;
  background: var(--surface);
  padding: 24px;
  border-radius: var(--card-radius);
  box-shadow: var(--elevation-1);
  min-width: 0;
}

.add-user-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.add-user-row input {
  flex: 1;
  padding: 12px 14px;
  border-radius: var(--small-radius);
  border: 1px solid var(--muted-border);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--muted-divider);
  padding: 18px 14px;
  vertical-align: middle;
}

.actions-cell {
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.admin-action {
  display: block;
  width: 100px;
  margin: 6px 0;
  padding: 6px 8px;
  border: 1px solid var(--muted-border);
  border-radius: var(--small-radius);
  cursor: pointer;
  background: var(--surface);
  color: var(--text);
  font-size: 0.85rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.btn { min-width: 120px; background: var(--primary); color: #fff; }

.menu-toggle {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--muted-border);
  background: var(--surface);
  cursor: pointer;
}

.menu-toggle {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--muted-border);
  background: var(--surface);
  cursor: pointer;
}

.error-message { margin-top: 12px; color: var(--danger); }
</style>
