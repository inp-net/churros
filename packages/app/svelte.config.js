import adapter from '@sveltejs/adapter-node';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import preprocess from 'svelte-preprocess';

// @generated buildinfo
const CURRENT_COMMIT = '72ad22314b5c607b60a9011f8884de8a929c28fd';
const CURRENT_VERSION = 'dev';
// end generated buildinfo

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
      name: CURRENT_VERSION === 'dev' ? undefined : CURRENT_VERSION || CURRENT_COMMIT,
    },
  },
};

export default config;
