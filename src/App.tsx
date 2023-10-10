import React, { type FC } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider
} from 'react-router-dom';

import { HeaderBar } from './organisms';
import { HomePage, ErrorPage, LoginPage, SignupPage } from './pages';
import Providers from './providers';

import './assets/scss/index.scss';

const router = createBrowserRouter([
  {
    element: (
      <div className='app'>
        <HeaderBar />
        <Outlet />
      </div>
    ),
    children: [
      {
        path: '/',
        element: <HomePage />,
        errorElement: <ErrorPage />
      },
      {
        path: '/signup',
        element: <SignupPage />
      },
      {
        path: '/login',
        element: <LoginPage />
      }
      // {
      //   path: '/verify/:id',
      //   element: <verifyMailPage />
      // }
    ]
  }
]);

const App: FC = () => (
  <Providers>
    <RouterProvider router={router} />
  </Providers>
);

export default App;
