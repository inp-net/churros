import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { dirname, resolve } from 'node:path';

// @generated buildinfo
const CURRENT_COMMIT = 'dev';
const CURRENT_VERSION = 'dev';
const CURRENT_VERSIONS = { api: 'dev', app: 'dev', sync: 'dev', db: 'dev' };
// end generated buildinfo

const here = dirname(new URL(import.meta.url).pathname);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: multiAdapter([
      adapterNode({
        out: 'build-node',
      }),
      adapterStatic({
        strict: false,
        fallback: 'index.html',
        pages: 'build-static',
        assets: 'build-static',
      }),
    ]),
    alias: {
      $houdini: resolve(here, '$houdini'),
    },
    version: {
      pollInterval: 30e3,
      name: CURRENT_VERSION === 'dev' ? undefined : CURRENT_VERSION || CURRENT_COMMIT,
    },
  },
};

function multiAdapter(adapters) {
  return {
    name: 'multi-adapter',
    async adapt(argument) {
      for (const adapter of adapters) {
        await Promise.resolve(adapter).then((resolved) => resolved.adapt(argument));
      }
    },
  };
}

export default config;
