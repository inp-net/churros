import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import preprocess from 'svelte-preprocess';

// @generated buildinfo
const CURRENT_COMMIT = '72ad22314b5c607b60a9011f8884de8a929c28fd';
const CURRENT_VERSION = 'dev';
// end generated buildinfo

const here = dirname(new URL(import.meta.url).pathname);

const adapter = process.env.BUILD_ADAPTER === 'static' ? adapterStatic : adapterNode;

console.log(adapter);
console.info(`Using ${process.env.BUILD_ADAPTER === 'static' ? 'static' : 'node'} adapter`);

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
    adapter: adapter({
      strict: false,
      fallback: 'index.html',
    }),
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
