import adapter from '@sveltejs/adapter-node';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import preprocess from 'svelte-preprocess';
import { CURRENT_VERSION } from './src/lib/buildinfo.js';

const here = dirname(new URL(import.meta.url).pathname);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      scss: {
        prependData: `@use "${fileURLToPath(
          new URL('src/design/variables.scss', import.meta.url),
        )}" as *;`,
      },
    }),
  ],

  kit: {
    adapter: adapter(),
    alias: {
      $houdini: resolve(here, '$houdini'),
    },
    version: {
      pollInterval: 30e3,
      name: CURRENT_VERSION,
    },
  },
};

export default config;
