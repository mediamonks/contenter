import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { user } from '@/store/user';
import Home from './views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sign-in',
    name: 'SignIn',
    component: () => import(/* webpackChunkName: "signIn" */ './views/SignIn.vue'),
    beforeEnter: (to, from, next) => {
      if (user.currentUser) {
        next({
          path: '/',
        });
      } else {
        next();
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (user.currentUser) {
      next();
      return;
    }

    next({
      path: '/sign-in',
    });
  } else {
    next();
  }
});

export default router;
