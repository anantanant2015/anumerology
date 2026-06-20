import { createRouter, createWebHistory } from 'vue-router';
import AccessGuardedView from './views/AccessGuardedView.vue';
import AdminView from './views/AdminView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: AccessGuardedView,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
