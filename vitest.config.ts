import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: 'test-mdx',
      enforce: 'pre',
      async transform(source, id) {
        if (!id.endsWith('.mdx')) {
          return null;
        }

        return {
          code: String(await compile(source)),
          map: null,
        };
      },
    },
  ],
  resolve: {
    alias: {
      '@': root,
      'server-only': path.join(root, 'node_modules/server-only/empty.js'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/{unit,component}/**/*.{test,spec}.{ts,tsx}'],
  },
});
