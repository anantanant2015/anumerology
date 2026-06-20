<template>
  <div class="app-shell">
    <header class="topbar">
      <CenteredContainer>
        <div class="brand">Astro Numerology</div>
        <div class="controls">
          <div v-if="isAuthenticated && user" class="user-meta">
            <span class="user-label">{{ user.name || user.email }}</span>
            <span
              v-if="currentUser && currentUser.isAdmin"
              class="role-badge"
              role="button"
              tabindex="0"
              @click="goAdmin"
              @keyup.enter="goAdmin"
            >
              {{ userLabel }}
            </span>
          </div>

          <button v-if="isLoading" class="btn btn-primary" disabled>
            Loading...
          </button>

          <button
            v-if="isAuthenticated"
            @click="logoutApp"
            class="btn btn-secondary"
          >
            Logout
          </button>
        </div>
      </CenteredContainer>
    </header>

    <main class="app-container">
      <CenteredContainer>
        <router-view />
      </CenteredContainer>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { findUserByEmail } from './utils/userStore';
import CenteredContainer from './components/CenteredContainer.vue';
import { useRouter } from 'vue-router';

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
const router = useRouter();
const goAdmin = () => router.push('/admin');
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg);
  font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-shell {
  width: 100%;
  margin: 0;
  padding: 24px 18px 0;
}

.inner {
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
}

:root {
  --bg: #f4f7f6;
  --surface: #ffffff;
  --primary: #03a9f4;
  --primary-700: #0288d1;
  --accent: #6200ea;
  --muted: #e0e0e0;
  --text: #2c3e50;
  --card-radius: 8px;
  --card-padding: 24px;
  --elevation-1: 0 4px 6px rgba(0,0,0,0.10);
  --elevation-2: 0 8px 22px rgba(0,0,0,0.08);
  --control-radius: 10px;
  --small-radius: 4px;
  --soft-bg: #f4f7ff;
  --muted-border: #dcdcdc;
  --muted-divider: #eaeaea;
  --danger: #d32f2f;
  --accent-2: #ab47bc;
  --compound-color: #c51162;
  --muted-hover: #bdbdbd;
}

/* shared Material-like primitives */
.card {
  background: var(--surface);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--elevation-1);
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
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover { background-color: var(--primary-700); }

.btn-secondary {
  background-color: var(--muted);
  color: var(--text);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 0 18px;
  padding: 16px 24px;
  background: var(--surface);
  border-radius: var(--control-radius);
  box-shadow: var(--elevation-1);
}

.brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text);
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-label {
  color: var(--text);
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

  /* reused shared button tokens above */

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
    background: var(--soft-bg);
    color: var(--primary-700);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
  }
</style>
