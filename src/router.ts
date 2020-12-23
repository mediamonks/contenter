import { createRouter, createWebHistory, RouteRecordRaw, RouterOptions } from 'vue-router';
import { checkIfUserIsSignedIn } from '@/store/user';
import { loadFirebaseAnalytics } from '@/firebase';

/* eslint-disable @typescript-eslint/naming-convention */
export const RouteNames = {
  HOME: 'Home',
  CREATE_PROJECT: 'CreateProject',
  SIGN_IN: 'SignIn',
  PROJECT: {
    DETAILS: 'ProjectDetails',
    LOCALE_LIST: 'ProjectLocaleList',
    SCHEMA: 'ProjectSchema',
    ASSETS: 'ProjectAssets',
    SETTINGS: 'ProjectSettings',
    CONTENT: 'ProjectContent',
  },
} as const;

export const RouteProperties = {
  PROJECT_ID: 'projectId',
  LOCALE: 'locale',
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

const routes: ReadonlyArray<RouteRecordRaw> = [
  {
    path: '/',
    name: RouteNames.HOME,
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create-project',
    name: RouteNames.CREATE_PROJECT,
    component: () => import(/* webpackChunkName: "createProject" */ '@/views/CreateProject.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sign-in',
    name: RouteNames.SIGN_IN,
    component: () => import(/* webpackChunkName: "signIn" */ '@/views/SignIn.vue'),
    beforeEnter: (to, from, next) => {
      checkIfUserIsSignedIn()
        .then(() => next({ path: '/' }))
        .catch(() => next());
    },
  },
  {
    path: `/project/:${RouteProperties.PROJECT_ID}`,
    name: RouteNames.PROJECT.DETAILS,
    component: () =>
      import(/* webpackChunkName: "projectDetail" */ '@/views/project/ProjectRoot.vue'),
    meta: { requiresAuth: true },
    props: true,
    children: [
      {
        path: `/project/:${RouteProperties.PROJECT_ID}/content`,
        name: RouteNames.PROJECT.LOCALE_LIST,
        component: () =>
          import(/* webpackChunkName: "projectDetailLocales" */ '@/views/project/LocaleList.vue'),
      },
      {
        path: `/project/:${RouteProperties.PROJECT_ID}/schema`,
        name: RouteNames.PROJECT.SCHEMA,
        component: () =>
          import(/* webpackChunkName: "projectDetailSchema" */ '@/views/project/Schema.vue'),
      },
      {
        path: `/project/:${RouteProperties.PROJECT_ID}/assets`,
        name: RouteNames.PROJECT.ASSETS,
        component: () =>
          import(/* webpackChunkName: "projectAssets" */ '@/views/project/AssetView.vue'),
      },
      {
        path: `/project/:${RouteProperties.PROJECT_ID}/settings`,
        name: RouteNames.PROJECT.SETTINGS,
        component: () =>
          import(/* webpackChunkName: "projectSettings" */ '@/views/project/ProjectSettings.vue'),
      },
      {
        path: `/project/:${RouteProperties.PROJECT_ID}/content/:${RouteProperties.LOCALE}`,
        name: RouteNames.PROJECT.CONTENT,
        component: () =>
          import(/* webpackChunkName: "projectDetailContent" */ '@/views/project/Content.vue'),
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_Url),
  routes,
} as RouterOptions);

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
    checkIfUserIsSignedIn()
      .then(() => next())
      .catch(() => next({ path: '/sign-in' }));
  } else {
    next();
  }
});

export default router;
