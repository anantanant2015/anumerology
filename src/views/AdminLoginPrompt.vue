<template>
  <div class="admin-prompt">
    <h2>Enter Admin Password</h2>
    <p>This is required only for approved users who are not already tagged as admin.</p>
    <input type="password" v-model="password" placeholder="Admin password" />
    <button @click="submitPassword" class="btn btn-primary">Continue</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';
import { isAdminUser } from '../utils/userStore';

const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const { user } = useAuth0();

const submitPassword = () => {
  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || '';
  if (!envPassword) {
    errorMessage.value = 'Admin password is not configured.';
    return;
  }

  if (password.value !== envPassword) {
    errorMessage.value = 'Incorrect admin password.';
    return;
  }

  if (user.value?.email && isAdminUser(user.value.email)) {
    router.push('/admin');
  } else {
    router.push('/admin');
  }
};
</script>

<style scoped>
.admin-prompt {
  width: 100%;
  max-width: 520px;
  background: var(--surface);
  padding: var(--card-padding);
  border-radius: var(--card-radius);
  box-shadow: var(--elevation-2);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

input {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--small-radius);
  border: 1px solid var(--muted-border);
}

.btn {
  width: fit-content;
}

.error-message {
  color: var(--danger);
}
</style>
