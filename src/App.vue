<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">Astro Numerology</div>
      <div class="controls">
        <div v-if="isAuthenticated && user" class="user-meta">
          <span class="user-label">{{ user.name || user.email }}</span>
          <span class="role-badge">{{ userLabel }}</span>
        </div>

        <button v-if="isLoading" class="btn btn-primary" disabled>
          Loading...
        </button>

        <button
          v-else-if="!isAuthenticated"
          @click="login"
          class="btn btn-primary"
        >
          Login
        </button>

        <button
          v-else
          @click="logoutApp"
          class="btn btn-secondary"
        >
          Logout
        </button>
      </div>
    </header>

    <main class="app-container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { findUserByEmail } from './utils/userStore';

const {
  isLoading,
  isAuthenticated,
  loginWithRedirect,
  logout,
  user,
} = useAuth0();

const currentUser = computed(() => findUserByEmail(user.value?.email));
const userLabel = computed(() => {
  if (!user.value) return '';
  if (currentUser.value?.isAdmin) return 'admin';
  if (currentUser.value?.isApproved) return 'approved';
  return 'pending';
});

const login = () => loginWithRedirect();
const logoutApp = () => logout({ logoutParams: { returnTo: window.location.origin } });
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f4f7f6;
  font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-shell {
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 18px 0;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 0 18px;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2c3e50;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-label {
  color: #444;
  font-size: 0.95rem;
}

.app-container {
  width: 100%;
  min-height: calc(100vh - 140px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 40px;
}

.btn {
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #03a9f4;
  color: white;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

  .user-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .role-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    background: #f0f4ff;
    color: #1e3a8a;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
