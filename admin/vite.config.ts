/**
 * File: vite.config.ts
 *
 * Description: Vite build configuration for the admin panel. Enables React plugin
 * for JSX/TSX support and sets the dev server to run on port 3001.
 *
 * Author: Navnit(Ninjacode911)
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3001 },
});
