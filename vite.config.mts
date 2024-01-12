import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import express from './express-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), express('server'), svgr()],
  server: {
    host: true,
    port: 3000,
  },
});
