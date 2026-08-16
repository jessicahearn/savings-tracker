import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 5 still defaults to Sass's legacy JS API, which ignores
        // silenceDeprecations (and is itself deprecated). The modern compiler
        // honours it.
        api: 'modern-compiler',
        // Bootstrap 5.3 predates the Sass module system and the CSS if(), so
        // every build emits ~80 warnings from a dependency we do not control.
        // None of these are about our stylesheet.
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
          'legacy-js-api',
        ],
      },
    },
  },
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
