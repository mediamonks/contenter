import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { checkIfUserIsSignedIn } from '@/store/user';
import Home from '@/views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/create-project',
    name: 'CreateProject',
    component: () => import(/* webpackChunkName: "createProject" */ '@/views/CreateProject.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sign-in',
    name: 'SignIn',
    component: () => import(/* webpackChunkName: "signIn" */ '@/views/SignIn.vue'),
    beforeEnter: (to, from, next) => {
      checkIfUserIsSignedIn().then(() => next({ path: '/' })).catch(() => next());
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    checkIfUserIsSignedIn().then(() => next()).catch(() => next({ path: '/sign-in' }));
  } else {
    next();
  }
});

export default router;
