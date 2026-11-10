import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/** Writes the list of built files into dist/sw.js so the app works offline after the first visit. */
function swPrecache(): Plugin {
  let outDir = 'dist';
  return {
    name: 'sw-precache',
    apply: 'build',
    configResolved(cfg) {
      outDir = cfg.build.outDir;
    },
    writeBundle(_opts, bundle) {
      const files = new Set<string>(['/', '/index.html', '/manifest.json',
        '/favicon.png', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/icons/apple-touch-icon.png']);
      for (const name of Object.keys(bundle)) {
        if (/\.(js|css|woff2?|svg)$/.test(name)) files.add('/' + name);
      }
      // gzip copy of the verbatim Quran text (smaller download); the plain file stays beside it
      const txt = path.join(outDir, 'quran', 'quran-uthmani.txt');
      if (fs.existsSync(txt)) {
        fs.writeFileSync(txt + '.gz', zlib.gzipSync(fs.readFileSync(txt), { level: 9 }));
        files.add('/quran/quran-uthmani.txt.gz');
      }
      const swPath = path.join(outDir, 'sw.js');
      const src = fs.readFileSync(swPath, 'utf8');
      const version = Date.now().toString(36);
      fs.writeFileSync(
        swPath,
        src.split('__PRECACHE_MANIFEST__').join(JSON.stringify([...files])).split('__BUILD_VERSION__').join(version)
      );
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), swPrecache()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
});
