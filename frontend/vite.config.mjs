import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Appends ?v=YYYYMMDD to script/link asset URLs in built index.html for cache busting
function versionedIndexHtml() {
  const version = process.env.VITE_BUILD_VERSION || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return {
    name: 'versioned-index-html',
    closeBundle() {
      const outDir = join(process.cwd(), 'dist');
      const htmlPath = join(outDir, 'index.html');
      try {
        let html = readFileSync(htmlPath, 'utf-8');
        html = html.replace(
          /\s(src|href)=["']([^"']+\.(js|css))["']/gi,
          (_, attr, url) => ` ${attr}="${url}${url.includes('?') ? '&' : '?'}v=${version}"`
        );
        writeFileSync(htmlPath, html);
      } catch (e) {
        // ignore if dist/index.html not found (e.g. build error)
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), versionedIndexHtml()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    // Adjust proxy target/path as needed for your backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

