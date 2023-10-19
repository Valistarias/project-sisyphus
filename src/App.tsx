import React, { useMemo, type FC } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider
} from 'react-router-dom';

import { HeaderBar } from './organisms';
import { HomePage, ErrorPage, LoginPage, SignupPage, DashboardPage, ForgotPassPage, NewPassPage } from './pages';
import { useGlobalVars } from './providers/globalVars';

import './assets/scss/index.scss';

const App: FC = () => {
  const { loading } = useGlobalVars();

  const router = useMemo(() => createBrowserRouter([
    {
      element: (
          <>
            <HeaderBar />
            <Outlet />
          </>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          element: <HomePage />
        },
        {
          path: '/signup',
          element: <SignupPage />
        },
        {
          path: '/login',
          element: <LoginPage />
        },
        {
          path: '/dashboard',
          element: <DashboardPage />
        },
        {
          path: '/reset/password',
          element: <ForgotPassPage />
        },
        {
          path: '/reset/password/:userId/:token',
          element: <NewPassPage />
        }
      ]
    }
  ]), []);

  return (
  <div className={`app${loading ? ' app--loading' : ''}`}>
    <div className="app__loader">
    </div>
    <RouterProvider router={router} />
  </div>
  );
};

export default App;
