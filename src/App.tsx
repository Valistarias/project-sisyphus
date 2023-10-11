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
      }
    ]
  }
]);

const App: FC = () => (
  <Providers>
    <RouterProvider router={router} />
  </Providers>
);

export default App;
