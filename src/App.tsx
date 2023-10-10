import React, { type FC } from 'react';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';

import Providers from './providers';

import { HomePage, ErrorPage } from './routes';
import Test from './routes/test';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/test',
    element: <Test />
  }
]);

const App: FC = () => (
  <Providers>
    <RouterProvider router={router} />
  </Providers>
);

export default App;
