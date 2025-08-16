import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Set your preferred port here
    strictPort: true, // If true, will error if port is busy instead of trying next port
  },
});
