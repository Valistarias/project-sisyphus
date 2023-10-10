import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from './express-plugin';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), express('server'), svgr()],
  server: {
    host: true,
    port: 3000
  }
});
