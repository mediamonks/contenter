import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { checkIfUserIsSignedIn } from '@/store/user';
import { loadFirebaseAnalytics } from '@/firebase';

// TODO: this should be a ReadonlyArray
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    // TODO: use consts for the names instead of strings
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
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
    // TODO: projectId should come from a const
    path: '/project/:projectId',
    name: 'ProjectDetails',
    component: () => import(/* webpackChunkName: "projectDetail" */ '@/views/project/ProjectRoot.vue'),
    meta: { requiresAuth: true },
    props: true,
    children: [
      {
        path: '/project/:projectId/content',
        name: 'ProjectLocaleList',
        component: () => import(/* webpackChunkName: "projectDetailLocales" */ '@/views/project/LocaleList.vue'),
      },
      {
        path: '/project/:projectId/schema',
        name: 'ProjectSchema',
        component: () => import(/* webpackChunkName: "projectDetailSchema" */ '@/views/project/Schema.vue'),
      },
      {
        path: '/project/:projectId/assets',
        name: 'ProjectAssets',
        component: () => import(/* webpackChunkName: "projectAssets" */ '@/views/project/Assets.vue'),
      },
      {
        path: '/project/:projectId/settings',
        name: 'ProjectSettings',
        component: () => import(/* webpackChunkName: "projectSettings" */ '@/views/project/ProjectSettings.vue'),
      },
      {
        path: '/project/:projectId/content/:locale',
        name: 'ProjectContent',
        component: () => import(/* webpackChunkName: "projectDetailContent" */ '@/views/project/Content.vue'),
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  loadFirebaseAnalytics().then((analytics) => {
    if (typeof to.name === 'string') {
      const { projectId } = to.params;

      const params: {
        name: string;
        projectId?: string;
      } = {
        name: to.name,
      };

      if (projectId && typeof projectId === 'string') {
        params.projectId = projectId;
      }

      analytics.logEvent('page_view', params);
    }
  });

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    checkIfUserIsSignedIn().then(() => next()).catch(() => next({ path: '/sign-in' }));
  } else {
    next();
  }
});

export default router;
