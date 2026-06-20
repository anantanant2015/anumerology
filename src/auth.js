import { reactive } from 'vue';
import { createAuth0Client } from '@auth0/auth0-spa-js';

const state = reactive({
  loading: true,
  isAuthenticated: false,
  user: null,
  auth0Client: null,
});

export const useAuth = () => state;

export async function initAuth(config) {
  state.auth0Client = await createAuth0Client(config);

  try {
    state.isAuthenticated = await state.auth0Client.isAuthenticated();
    state.user = state.isAuthenticated ? await state.auth0Client.getUser() : null;
  } catch (error) {
    console.error('Auth initialization failed', error);
  } finally {
    state.loading = false;
  }
}

export function loginWithRedirect() {
  return state.auth0Client.loginWithRedirect();
}

export function logout() {
  return state.auth0Client.logout({ returnTo: window.location.origin });
}

export async function handleRedirectCallback() {
  const result = await state.auth0Client.handleRedirectCallback();
  state.user = await state.auth0Client.getUser();
  state.isAuthenticated = true;
  state.loading = false;
  return result;
}
