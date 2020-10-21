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
  {
    path: '/project/:projectId',
    name: 'ProjectDetails',
    component: () => import(/* webpackChunkName: "projectDetail" */ '@/views/project/ProjectRoot.vue'),
    meta: { requiresAuth: true },
    props: true,
    children: [
      {
        path: '/project/:projectId/',
        name: 'ProjectContent',
        component: () => import(/* webpackChunkName: "projectDetailContent" */ '@/views/project/Content.vue'),
      },
      {
        path: '/project/:projectId/schema',
        name: 'ProjectSchema',
        component: () => import(/* webpackChunkName: "projectDetailSchema" */ '@/views/project/Schema.vue'),
      },
      {
        path: '/project/:projectId/settings',
        name: 'ProjectSettings',
        component: () => import(/* webpackChunkName: "projectSettings" */ '@/views/project/ProjectSettings.vue'),
      },
    ],
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
