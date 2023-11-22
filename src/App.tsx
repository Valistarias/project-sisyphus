import React, { useMemo, type FC } from 'react';

import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { useGlobalVars } from './providers';

import {
  AdminEditChapterPage,
  AdminEditNotionPage,
  AdminEditPage,
  AdminEditRuleBookPage,
  AdminNewChapterPage,
  AdminNewNotionPage,
  AdminNewPage,
  AdminNewRuleBookPage,
  AdminPage,
  AdminRuleBooksPage,
  DashboardPage,
  ErrorPage,
  ForgotPassPage,
  HomePage,
  LoginPage,
  NewPassPage,
  SignupPage,
} from './pages';

import { HeaderBar } from './organisms';

import './assets/scss/index.scss';

const App: FC = () => {
  const { loading } = useGlobalVars();

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: (
            <>
              <HeaderBar className="app__headerbar" />
              <div className="app__content">
                <Outlet />
              </div>
            </>
          ),
          errorElement: <ErrorPage />,
          children: [
            // Unlogged
            {
              path: '/',
              element: <HomePage />,
            },
            {
              path: '/signup',
              element: <SignupPage />,
            },
            {
              path: '/login',
              element: <LoginPage />,
            },
            {
              path: '/reset/password',
              element: <ForgotPassPage />,
            },
            {
              path: '/reset/password/:userId/:token',
              element: <NewPassPage />,
            },
            // Logged
            {
              path: '/dashboard',
              element: <DashboardPage />,
            },
            // {
            //   path: '/rulebooks',
            //   element: <RuleBooksPage />,
            // },
            // {
            //   path: '/rulebook/:id',
            //   element: <RuleBookSinglePage />,
            // },
            // {
            //   path: '/rulebook/:id/:chapter',
            //   element: <ChapterSinglePage />,
            // },
            // Admin
            {
              path: '/admin',
              element: <AdminPage />,
            },
            {
              path: '/admin/rulebooks',
              element: <AdminRuleBooksPage />,
            },
            {
              path: '/admin/rulebook/new',
              element: <AdminNewRuleBookPage />,
            },
            {
              path: '/admin/rulebook/:id',
              element: <AdminEditRuleBookPage />,
            },
            {
              path: '/admin/notion/new',
              element: <AdminNewNotionPage />,
            },
            {
              path: '/admin/notion/:id',
              element: <AdminEditNotionPage />,
            },
            {
              path: '/admin/chapter/new',
              element: <AdminNewChapterPage />,
            },
            {
              path: '/admin/chapter/:id',
              element: <AdminEditChapterPage />,
            },
            {
              path: '/admin/page/new',
              element: <AdminNewPage />,
            },
            {
              path: '/admin/page/:id',
              element: <AdminEditPage />,
            },
          ],
        },
      ]),
    []
  );

  return (
    <div className={`app${loading ? ' app--loading' : ''}`}>
      <div className="app__loader"></div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
