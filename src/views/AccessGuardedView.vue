<template>
  <div class="guarded-view centered-shell">
    <div v-if="isLoading" class="page-card">
      <h2>Checking access...</h2>
    </div>

    <div v-else-if="!isAuthenticated" class="page-card login-card">
      <h2>Access restricted</h2>
      <p>Please log in to access the calculation page.</p>
      <button @click="login" class="btn btn-primary">Login</button>
    </div>

    <div v-else-if="isBlocked" class="page-card blocked-card">
      <h2>Access blocked</h2>
      <p>Your account is blocked and cannot access this page.</p>
    </div>

    <div v-else-if="!isApproved" class="page-card pending-card">
      <h2>Approval required</h2>
      <p>Your account is not yet approved for access.</p>
    </div>

    <div v-else class="page-card calculator-page">
      <NumerologyCalculator />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import NumerologyCalculator from '../components/NumerologyCalculator.vue';
import { userHasAccess, findUserByEmail } from '../utils/userStore';

const { isLoading, isAuthenticated, loginWithRedirect, user } = useAuth0();

const login = () => loginWithRedirect();

const currentUser = computed(() => findUserByEmail(user.value?.email));
const isApproved = computed(() => currentUser.value?.isApproved === true);
const isBlocked = computed(() => currentUser.value?.blocked === true);

const accessAllowed = computed(() => {
  if (!user.value?.email) return false;
  return userHasAccess(user.value.email);
});
</script>

<style scoped>
.page-card {
  width: 100%;
  max-width: 740px;
  background: var(--surface);
  padding: 28px;
  border-radius: var(--card-radius);
  box-shadow: var(--elevation-2);
}

.calculator-page {
  width: 100%;
  max-width: 100%;
  padding: 0;
  box-shadow: none;
  background: transparent;
}

.centered-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 12px;
}

.guarded-view {
  width: 100%;
}

.login-card,
.blocked-card,
.pending-card {
  text-align: center;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: var(--control-radius);
  background: var(--primary);
  color: #fff;
  cursor: pointer;
}
</style>
