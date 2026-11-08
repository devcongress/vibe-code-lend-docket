import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const cloudflareConfigPath =
  process.env['LENDDOCKET_TARGET'] === 'playground'
    ? './wrangler.playground.jsonc'
    : './wrangler.jsonc';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 550,
  },
  plugins: [react(), cloudflare({ configPath: cloudflareConfigPath })],
});
