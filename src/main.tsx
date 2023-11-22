import React from 'react';

import { createRoot } from 'react-dom/client';

import { Providers } from './providers';

import App from './App';

const container = document.getElementById('root');
if (container === null) throw new Error('Failed to find the root element');

const root = createRoot(container);

root.render(
  <Providers>
    <App />
  </Providers>
);
